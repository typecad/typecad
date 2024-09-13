/**
 * Used internally
 * @ignore
 */
export type Bounds = {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Section of schematic
|    |    |    |    |
|:---:|:---:|:---:|:---:|
| 01 | 02  | 03  | 04  |
| 05  | 06  | 07  | 08  |
| 09  | 10 | 11 | 12 |
| 13 | 14 | 15 | 16 |

Section of box
|    |    |    |    |    |
|:---:|:---:|:---:|:---:|:---:|
| 01 | 02 | 03 | 04 | 05 |
| 06 | 07 | 08 | 09 | 10 |
| 11 | 12 | 13 | 14 | 15 |
| 16 | 17 | 18 | 19 | 20 |
| 21 | 22 | 23 | 24 | 25 |
 */
export function Box(n: number, nn?: number): Bounds {
    let qx: number = 0;
    let qy: number = 0;
    let qqx: number = 0;
    let qqy: number = 0;

    switch (n) {
        case 1:
            qx = 1; qy = 1;
            break;
        case 2:
            qx = 2; qy = 1;
            break;
        case 3:
            qx = 3; qy = 1;
            break;
        case 4:
            qx = 4; qy = 1;
            break;
        case 5:
            qx = 1; qy = 2;
            break;
        case 6:
            qx = 2; qy = 2;
            break;
        case 7:
            qx = 3; qy = 2;
            break;
        case 8:
            qx = 4; qy = 2;
            break;
        case 9:
            qx = 1; qy = 3;
            break;
        case 10:
            qx = 2; qy = 3;
            break;
        case 11:
            qx = 3; qy = 3;
            break;
        case 12:
            qx = 4; qy = 3;
            break;
        case 13:
            qx = 1; qy = 4;
            break;
        case 14:
            qx = 2; qy = 4;
            break;
        case 15:
            qx = 3; qy = 4;
            break;
        case 16:
            qx = 4; qy = 4;
            break;
        default:
            qx = 1; qy = 1;
            break;
    }

    switch (nn) {
        case 1:
            qqx = 1; qqy = 1;
            break;
        case 2:
            qqx = 2; qqy = 1;
            break;
        case 3:
            qqx = 3; qqy = 1;
            break;
        case 4:
            qqx = 4; qqy = 1;
            break;
        case 5:
            qqx = 5; qqy = 1;
            break;
        case 6:
            qqx = 1; qqy = 2;
            break;
        case 7:
            qqx = 2; qqy = 2;
            break;
        case 8:
            qqx = 3; qqy = 2;
            break;
        case 9:
            qqx = 4; qqy = 2;
            break;
        case 10:
            qqx = 5; qqy = 2;
            break;
        case 11:
            qqx = 1; qqy = 3;
            break;
        case 12:
            qqx = 2; qqy = 3;
            break;
        case 13:
            qqx = 3; qqy = 3;
            break;
        case 14:
            qqx = 4; qqy = 3;
            break;
        case 15:
            qqx = 5; qqy = 3;
            break;
        case 16:
            qqx = 1; qqy = 4;
            break;
        case 17:
            qqx = 2; qqy = 4;
            break;
        case 18:
            qqx = 3; qqy = 4;
            break;
        case 19:
            qqx = 4; qqy = 4;
            break;
        case 20:
            qqx = 5; qqy = 4;
            break;
        case 21:
            qqx = 1; qqy = 5;
            break;
        case 22:
            qqx = 2; qqy = 5;
            break;
        case 23:
            qqx = 3; qqy = 5;
            break;
        case 24:
            qqx = 4; qqy = 5;
            break;
        case 25:
            qqx = 5; qqy = 5;
            break;
        default:
            qqx = 1; qqy = 1;
            break;
    }

    if (nn != undefined) {
        return new Q(qx, qy, qqx, qqy);
    } else {
        return new Q(qx, qy);
    }
}

class Q {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(qx: number, qy: number, qqx?: number, qqy?: number) {
        let q: Bounds = { x: 0, y: 0, w: 0, h: 0 };
        let sheet_width: number = 270;
        let sheet_height: number = 165;
        let sheet_w_offset = 15;
        let sheet_h_offset = 15;
        let pad = 5;
        let qw = (sheet_width / 4) - 5;
        let qh: number = (sheet_height / 4) - 8;

        qx -= 1;
        qy -= 1;

        this.x = (qw * qx) + sheet_w_offset + (pad * qx);
        this.y = (qh * qy) + sheet_h_offset + (pad * qy);
        this.w = qw;
        this.h = qh;

        let grid_width: number = qw;
        let grid_height: number = qh;
        let grid_width_offset: number = 4;
        let grid_height_offset: number = 6;
        grid_width -= grid_width_offset;
        grid_height -= grid_height_offset;

        let gqw = (grid_width / 5);
        let gqh = (grid_height / 5);

        if ((qqx == undefined) && (qqy == undefined)) {
            q.x = this.x;
            q.y = this.y;
            q.w = this.w;
            q.h = this.h;
        } else {
            qqx! -= 1;
            qqy! -= 1;
            q.x = (gqw * qqx!) + this.x + grid_width_offset;
            q.y = (gqh * qqy!) + this.y + grid_height_offset;
            q.w = this.w;
            q.h = this.h;
        }
        return q;
    }
}