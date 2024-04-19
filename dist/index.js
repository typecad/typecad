#!/usr/bin/env tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Devices = exports.Box = exports.Coord = exports.Pin = exports.Sheet = exports.Schematic = exports.KiCodeTextBox = exports.Component = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const s_expression_js_1 = __importDefault(require("s-expression.js"));
const S = new s_expression_js_1.default();
const chalk_1 = __importDefault(require("chalk"));
const fast_sexpr_1 = __importDefault(require("fast-sexpr"));
const node_child_process_1 = require("node:child_process");
//const kicad_symbol = "/usr/share/kicad/symbols/";
const kicad_symbol = "C:/Program Files/KiCad/8.0/share/kicad/symbols";
class Component {
    /**
     * Creates a Component.
     *
     * @constructor
     * @param {string} symbol
     * @param {string} reference
     * @param {?string} [value]
     * @param {?string} [footprint]
     * @param {?Bounds} [nn]
     */
    constructor(symbol, reference, value, footprint, nn) {
        this.Footprint = '';
        this.symbol = '';
        this.coord = { x: 0, y: 0 };
        this.Reference = '';
        this.Value = '';
        this.Datasheet = '';
        this.symbol = symbol;
        if (nn != undefined) {
            this.xy(nn.x, nn.y);
        }
        else {
            this.xy(Math.floor(Math.random() * 200), Math.floor(Math.random() * 200));
        }
        if (value != undefined) {
            this.Value = value;
        }
        if (reference != undefined) {
            this.Reference = reference;
        }
        if (footprint != undefined) {
            this.Footprint = footprint;
        }
    }
    pin(number) {
        return new Pin({ Number: number, Owner: this, type: 'passive' });
    }
    update() {
        let component_props = [];
        // add symbol-generics
        component_props.push([`lib_id "${this.symbol}"`]); // links to a lib_symbols item
        component_props.push([`at ${this.coord.x} ${this.coord.y} 0`]); // left/right up/down angle
        // add inherited properties
        Object.getOwnPropertyNames(this).forEach((val) => {
            if ((typeof this[val] == "string") || (typeof this[val] == "number")) {
                // ignore non-string|number properties
                component_props.push([
                    `property "${val}" "${this[val]}"`,
                    [`at ${this.coord.x + 5.08} ${this.coord.y + 5.08} 0`],
                    [`effects`, [`hide yes`]],
                ]);
            }
        });
        let s = S.serialize(component_props, { includingRootParentheses: false });
        s = "(symbol " + s + ")";
        return s;
    }
    symbol_lib(symbol) {
        let symbol_file_contents = "";
        let symbol_file_name = symbol.split(":");
        let symbol_lib = '';
        try {
            if (node_fs_1.default.existsSync(`${kicad_symbol}/${symbol_file_name[0]}.kicad_sym`)) {
                symbol_file_contents = node_fs_1.default.readFileSync(`${kicad_symbol}/${symbol_file_name[0]}.kicad_sym`, "utf8");
            }
            else {
                symbol_file_contents = node_fs_1.default.readFileSync(`./lib/${symbol_file_name[0]}.kicad_sym`, "utf8");
            }
            symbol_file_contents = symbol_file_contents.replaceAll('"', "`");
            const l = (0, fast_sexpr_1.default)(symbol_file_contents).pop();
            // search through sym file for the symbol
            for (var i in l) {
                if (l[i][1] == `\`${symbol_file_name[1]}\``) {
                    // replace the name with the fqn
                    l[i][1] = `"${symbol_file_name[0]}:${symbol_file_name[1]}"`;
                    for (var ii in l[i]) {
                        if (l[i][ii][1] == '`Reference`') {
                            if (this.Reference == '') {
                                this.Reference = l[i][ii][2].replaceAll(`\``, "");
                            }
                        }
                        if (l[i][ii][1] == '`Value`') {
                            if (this.Value == '') {
                                this.Value = l[i][ii][2].replaceAll(`\``, "");
                            }
                        }
                    }
                    // check if this is an 'extends' part
                    if (l[i][2][0] == "extends") {
                        // remove `
                        var extends_name = l[i][2][1].replaceAll(`\``, "");
                        // replace the name with the fqn
                        l[i][2][1] = `"${symbol_file_name[0]}:${extends_name}"`;
                        this.symbol = `${symbol_file_name[0]}:${extends_name}`;
                        return this.symbol_lib(`${symbol_file_name[0]}:${extends_name}`);
                    }
                    // replace ` with "
                    symbol_lib = S.serialize(l[i]).replaceAll("`", '"');
                }
            }
        }
        catch (err) {
            console.error(err);
        }
        if (symbol_lib == '') {
            // try in project folder
            console.log('- ', chalk_1.default.red.bold(`ERROR: symbol ${symbol} not found`));
        }
        return symbol_lib;
    }
    xy(x, y) {
        if (x == undefined)
            x = Math.floor(Math.random() * 100);
        if (y == undefined)
            y = Math.floor(Math.random() * 100);
        this.coord.x = 2.54 * Math.ceil(x / 2.54);
        this.coord.y = 2.54 * Math.ceil(y / 2.54);
    }
}
exports.Component = Component;
class KiCodeTextBox {
    constructor() {
        this.name = "text_box";
        this.x = 0;
        this.y = 0;
        this.height = 30;
        this.width = 70;
        this.border_width = 0.5;
        this.border_color = { r: 72, g: 72, b: 72, a: 1 };
        this.background = { r: 0, g: 0, b: 0, a: 0 };
        this.font = {
            size: 1.27,
            bold: "no",
            italic: "no",
            color: { r: 72, g: 72, b: 72, a: 1 },
        };
        this.justify = "top left";
    }
}
exports.KiCodeTextBox = KiCodeTextBox;
class Schematic {
    constructor(Sheetname) {
        this.schematic = '';
        this.symbols = []; // all the components
        this.symbol_libs = []; // all the symbol libs
        this.nets = []; // all the nets
        this.sheets = [];
        this.boxes = [];
        this.net_list = [];
        this.Sheetname = Sheetname;
    }
    create(...components) {
        components.forEach((component) => {
            // this.symbols.push(component.update());
            // this.symbol_libs.push(component.symbol_lib(component.symbol));
            this.component(component);
        });
        this.schematic =
            '(kicad_sch(version 20231120)(generator "kicode")(generator_version "8.0")(paper "A4")';
        this.schematic += "(lib_symbols";
        for (var i in this.symbol_libs) {
            this.schematic += this.symbol_libs[i];
        }
        this.schematic += ")";
        for (var i in this.symbols) {
            this.schematic += this.symbols[i];
        }
        for (var i in this.nets) {
            this.schematic += this.nets[i];
        }
        for (var i in this.sheets) {
            this.schematic += this.sheets[i];
        }
        for (var i in this.boxes) {
            this.schematic += this.boxes[i];
        }
        this.schematic += '(sheet_instances(path "/"(page "1"))))';
        try {
            node_fs_1.default.writeFileSync(`${this.Sheetname}.kicad_sch`, this.schematic);
        }
        catch (err) {
            console.error(err);
        }
        this.schematic = "";
        this.symbol_libs = [];
        this.symbols = [];
        this.nets = [];
        this.sheets = [];
        this.boxes = [];
    }
    netlist() {
        const runCommand = (command) => {
            try {
                (0, node_child_process_1.execSync)(`${command}`, { stdio: "inherit" });
            }
            catch (e) {
                console.error(`Failed executing ${command}`, e);
                return false;
            }
            return true;
        };
        console.log(chalk_1.default.white("+"), chalk_1.default.cyan("netlist"));
        runCommand(`"C:\\Program Files\\KiCad\\8.0\\bin\\kicad-cli.exe" sch export netlist ${this.Sheetname}.kicad_sch`);
    }
    net(name, ...pins) {
        pins.forEach((pin) => {
            var x = -1;
            var y = -1;
            var a = -1;
            var effects = "";
            if (pin.Owner != undefined) {
                const l = (0, fast_sexpr_1.default)(pin.Owner.symbol_lib(pin.Owner.symbol)).pop();
                for (var i in l) {
                    for (var ii in l[i]) {
                        // if (l[i][ii] == 'Reference') {
                        //     console.log(l[i][2])
                        // }
                        if (l[i][ii][0] == "pin") {
                            for (var iii in l[i][ii]) {
                                if (l[i][ii][iii][0] == "number") {
                                    if (l[i][ii][iii][1] == pin.Number) {
                                        for (var iiii in l[i][ii]) {
                                            if (l[i][ii][iiii][0] == "at") {
                                                x = parseFloat(l[i][ii][iiii][1]);
                                                y = parseFloat(l[i][ii][iiii][2]);
                                                a = parseFloat(l[i][ii][iiii][3]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (x == -1) {
                    console.log('- ', chalk_1.default.red.bold(`ERROR: pin ${pin.Number} of ${pin.Owner.symbol} not found`));
                }
                // fix label direction
                switch (a) {
                    case 0:
                        a = 0;
                        effects = "(effects(justify right bottom))";
                        break;
                    case 180:
                        a = 0;
                        break;
                    case 90:
                        a = 0;
                        effects = "(effects(justify right top))";
                        break;
                    case 270:
                        a = 180;
                        break;
                    default:
                        break;
                }
                if (pin.hier == true) {
                    this.nets.push(`(hierarchical_label "${pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y} ${a})(shape ${pin.type}))`);
                    console.log(chalk_1.default.white("+"), chalk_1.default.yellow("hier label"), chalk_1.default.white.bold(pin.Name));
                }
                else {
                    this.nets.push(`(label "${name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y} ${a}) ${effects})`);
                    console.log(chalk_1.default.white("+"), chalk_1.default.blue("net label"), chalk_1.default.white.bold(name));
                }
            }
            else if (pin.x != undefined) {
                // else it is a label connecting to a hier pin on a sheet
                this.nets.push(`(label "${name}"(at ${pin.x} ${pin.y} ${a})(effects(justify right bottom)))`);
                console.log(chalk_1.default.white("+"), chalk_1.default.yellow("sheet hier label"), chalk_1.default.white.bold(name));
            }
        });
        pins.forEach((pin) => {
            this.net_list.push({ name: name, pins: pin });
        });
    }
    hier_pin(sheet_pin, ...pins) {
        var x = 0;
        var y = 0;
        var a = 0;
        var effects = "";
        pins.forEach((pin) => {
            if (pin.Owner != undefined) {
                const l = (0, fast_sexpr_1.default)(pin.Owner.symbol_lib(pin.Owner.symbol)).pop();
                for (var i in l) {
                    for (var ii in l[i]) {
                        if (l[i][ii][0] == "pin") {
                            for (var iii in l[i][ii]) {
                                if (l[i][ii][iii][0] == "number") {
                                    if (l[i][ii][iii][1] == pin.Number) {
                                        for (var iiii in l[i][ii]) {
                                            if (l[i][ii][iiii][0] == "at") {
                                                x = parseFloat(l[i][ii][iiii][1]);
                                                y = parseFloat(l[i][ii][iiii][2]);
                                                a = parseFloat(l[i][ii][iiii][3]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // fix label direction
                switch (a) {
                    case 0:
                        a = 0;
                        effects = "(effects(justify right bottom))";
                        break;
                    case 180:
                        a = 0;
                        break;
                    case 90:
                        a = 0;
                        effects = "(effects(justify right top))";
                        break;
                    case 270:
                        a = 180;
                        break;
                    default:
                        break;
                }
                this.nets.push(`(hierarchical_label "${sheet_pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y} ${a})(shape ${sheet_pin.type})${effects})`);
                console.log(chalk_1.default.white("+"), chalk_1.default.yellow("hier label"), chalk_1.default.white.bold(pin.Name));
                if (pin.hier == true) {
                    this.nets.push(`(hierarchical_label "${pin.Name}"(at ${pin.Owner.coord.x + x} ${pin.Owner.coord.y - y} ${a})(shape ${pin.type})${effects})`);
                    console.log(chalk_1.default.white("+"), chalk_1.default.yellow("hier label"), chalk_1.default.white.bold(pin.Name));
                }
            }
        });
    }
    box(...box_object) {
        box_object.forEach((box) => {
            this.boxes.push(`(text_box "${box.name}"(at ${box.x} ${box.y} 0)(size ${box.width} ${box.height})(stroke(width ${box.border_width})
            (type default)(color ${box.border_color.r} ${box.border_color.g} ${box.border_color.b} ${box.border_color.a}))
            (fill(type color)(color ${box.background.r} ${box.background.g} ${box.background.b} ${box.background.a}))
            (effects(font(size ${box.font.size} ${box.font.size})(color ${box.font.color.r} ${box.font.color.g} ${box.font.color.b} ${box.font.color.a})(bold ${box.font.bold})(italic ${box.font.italic}))(justify ${box.justify}))
            )`);
            console.log(chalk_1.default.white("+"), chalk_1.default.gray("box"));
        });
    }
    component(component) {
        this.symbol_libs.push(component.symbol_lib(component.symbol)); // has to be before next line to get the right references and 
        this.symbols.push(component.update());
        console.log(chalk_1.default.white("+"), chalk_1.default.green("component"), chalk_1.default.white.bold(component.symbol));
    }
    sheet(sheet) {
        this.sheets.push(sheet.add());
    }
}
exports.Schematic = Schematic;
class Sheet extends Schematic {
    constructor(name, owner, x, y, ...pins) {
        super(name);
        this.coord = { x: 0, y: 0 };
        this.pin_list = [];
        this.pins_list = [];
        if ((x != undefined) && (y != undefined)) {
            this.xy(x, y);
        }
        else {
            this.xy(Math.floor(Math.random() * 200), Math.floor(Math.random() * 200));
        }
        this.Sheetname = name;
        this.Schematic = owner;
        pins.forEach((pin) => {
            this.pins_list.push(pin);
        });
    }
    xy(x, y) {
        this.coord.x = 2.54 * Math.ceil(x / 2.54);
        this.coord.y = 2.54 * Math.ceil(y / 2.54);
    }
    // get_x() {
    //     return this.coord.x;
    // }
    // get_y() {
    //     return this.coord.y;
    // }
    // pins(...pins: Pin[]) {
    //     pins.forEach((pin) => {
    //         this.pins_list.push(pin);
    //     });
    // }
    add() {
        let pins_in_sheet = 1; // start at one for buffer space
        this.pins_list.forEach((pin, index) => {
            pins_in_sheet++;
        });
        var s = "";
        s += `(sheet(at ${this.coord.x} ${this.coord.y})(size 20 ${pins_in_sheet * 2.54})\n`;
        s += `(property "Sheetname" "${this.Sheetname}"(at ${this.coord.x} ${this.coord.y} 0)(effects(font(size 1.27 1.27))(justify left bottom)))\n`;
        s += `(property "Sheetfile" "${this.Sheetname}.kicad_sch"(at ${this.coord.x - 13} ${this.coord.y} 0)(effects(hide yes)(font(size 1.27 1.27))(justify left top)))\n`;
        this.pins_list.forEach((pin, index) => {
            this.pins_list[index].x = this.coord.x;
            this.pins_list[index].y = this.coord.y + (pin.order * 2.54);
            s += `(pin "${pin.Name}" ${pin.type}(at ${this.coord.x} ${this.coord.y + (pin.order * 2.54)} ${pin.a}))`;
        });
        s += `)`;
        console.log(chalk_1.default.white("+"), chalk_1.default.red("sheet"), chalk_1.default.white.bold(this.Sheetname));
        return s;
    }
    create(...components) {
        this.Schematic.sheet(this);
        super.create(...components);
    }
    hier(sheet_pin, ...pins) {
        this.pins_list.push(sheet_pin);
        super.hier_pin(sheet_pin, ...pins);
        // let p = this.pin(sheet_pin.Name);
        // p.x = this.coord.x;
        // p.y = this.coord.y + (p.order * 2.54);
        // this.Schematic.net(sheet_pin.Name, p);
    }
    pin(pin_name) {
        let found_index = -1;
        this.pins_list.forEach((pin, index) => {
            if (pin.Name == pin_name) {
                found_index = index;
            }
        });
        return this.pins_list[found_index];
    }
}
exports.Sheet = Sheet;
class Pin {
    constructor({ Number, Name, Owner, x, y, a, hier, type, order } = {}) {
        this.Number = -1;
        this.Name = '';
        this.Owner = undefined;
        this.x = -1;
        this.y = -1;
        this.a = 180;
        this.type = {};
        this.hier = false;
        this.hier_to_net = false;
        this.order = 1;
        if (Number != undefined)
            this.Number = Number;
        if (Name != undefined)
            this.Name = Name;
        if (Owner != undefined)
            this.Owner = Owner;
        if (x != undefined)
            this.x = x;
        if (y != undefined)
            this.y = y;
        if (a != undefined)
            this.a = a;
        if (hier != undefined)
            this.hier = hier;
        if (type != undefined)
            this.type = type;
        if (order != undefined)
            this.order = order;
        if (x != undefined)
            this.hier_to_net = true;
    }
}
exports.Pin = Pin;
function Coord(coordinate) {
    return 2.54 * Math.ceil(coordinate / 2.54);
}
exports.Coord = Coord;
function Box(n, nn) {
    let qx = 0;
    let qy = 0;
    let qqx = 0;
    let qqy = 0;
    switch (n) {
        case 1:
            qx = 1;
            qy = 1;
            break;
        case 2:
            qx = 2;
            qy = 1;
            break;
        case 3:
            qx = 3;
            qy = 1;
            break;
        case 4:
            qx = 4;
            qy = 1;
            break;
        case 5:
            qx = 1;
            qy = 2;
            break;
        case 6:
            qx = 2;
            qy = 2;
            break;
        case 7:
            qx = 3;
            qy = 2;
            break;
        case 8:
            qx = 4;
            qy = 2;
            break;
        case 9:
            qx = 1;
            qy = 3;
            break;
        case 10:
            qx = 2;
            qy = 3;
            break;
        case 11:
            qx = 3;
            qy = 3;
            break;
        case 12:
            qx = 4;
            qy = 3;
            break;
        case 13:
            qx = 1;
            qy = 4;
            break;
        case 14:
            qx = 2;
            qy = 4;
            break;
        case 15:
            qx = 3;
            qy = 4;
            break;
        case 16:
            qx = 4;
            qy = 4;
            break;
        default:
            qx = 1;
            qy = 1;
            break;
    }
    switch (nn) {
        case 1:
            qqx = 1;
            qqy = 1;
            break;
        case 2:
            qqx = 2;
            qqy = 1;
            break;
        case 3:
            qqx = 3;
            qqy = 1;
            break;
        case 4:
            qqx = 4;
            qqy = 1;
            break;
        case 5:
            qqx = 5;
            qqy = 1;
            break;
        case 6:
            qqx = 1;
            qqy = 2;
            break;
        case 7:
            qqx = 2;
            qqy = 2;
            break;
        case 8:
            qqx = 3;
            qqy = 2;
            break;
        case 9:
            qqx = 4;
            qqy = 2;
            break;
        case 10:
            qqx = 5;
            qqy = 2;
            break;
        case 11:
            qqx = 1;
            qqy = 3;
            break;
        case 12:
            qqx = 2;
            qqy = 3;
            break;
        case 13:
            qqx = 3;
            qqy = 3;
            break;
        case 14:
            qqx = 4;
            qqy = 3;
            break;
        case 15:
            qqx = 5;
            qqy = 3;
            break;
        case 16:
            qqx = 1;
            qqy = 4;
            break;
        case 17:
            qqx = 2;
            qqy = 4;
            break;
        case 18:
            qqx = 3;
            qqy = 4;
            break;
        case 19:
            qqx = 4;
            qqy = 4;
            break;
        case 20:
            qqx = 5;
            qqy = 4;
            break;
        case 21:
            qqx = 1;
            qqy = 5;
            break;
        case 22:
            qqx = 2;
            qqy = 5;
            break;
        case 23:
            qqx = 3;
            qqy = 5;
            break;
        case 24:
            qqx = 4;
            qqy = 5;
            break;
        case 25:
            qqx = 5;
            qqy = 5;
            break;
        default:
            qqx = 1;
            qqy = 1;
            break;
    }
    if (nn != undefined) {
        return new Q(qx, qy, qqx, qqy);
    }
    else {
        return new Q(qx, qy);
    }
}
exports.Box = Box;
class Q {
    constructor(qx, qy, qqx, qqy) {
        let q = { x: 0, y: 0, w: 0, h: 0 };
        let sheet_width = 270;
        let sheet_height = 165;
        let sheet_w_offset = 15;
        let sheet_h_offset = 15;
        let pad = 5;
        let qw = (sheet_width / 4) - 5;
        let qh = (sheet_height / 4) - 8;
        qx -= 1;
        qy -= 1;
        this.x = (qw * qx) + sheet_w_offset + (pad * qx);
        this.y = (qh * qy) + sheet_h_offset + (pad * qy);
        this.w = qw;
        this.h = qh;
        let grid_width = qw;
        let grid_height = qh;
        let grid_width_offset = 4;
        let grid_height_offset = 6;
        grid_width -= grid_width_offset;
        grid_height -= grid_height_offset;
        let gqw = (grid_width / 5);
        let gqh = (grid_height / 5);
        if ((qqx == undefined) && (qqy == undefined)) {
            q.x = this.x;
            q.y = this.y;
            q.w = this.w;
            q.h = this.h;
        }
        else {
            qqx -= 1;
            qqy -= 1;
            q.x = (gqw * qqx) + this.x + grid_width_offset;
            q.y = (gqh * qqy) + this.y + grid_height_offset;
            q.w = this.w;
            q.h = this.h;
        }
        return q;
    }
}
/** Devices */
var Devices;
(function (Devices) {
    /** small capacitor: p1, p2 */
    Devices["C_Small"] = "Device:C_Small";
    /** small diode: pin 1 anode, pin 2 cathode */
    Devices["D_Small"] = "Device:D_Small";
    /** small resistor: p1, p2 */
    Devices["R_Small"] = "Device:R_Small";
})(Devices || (exports.Devices = Devices = {}));
