export class ReferenceCounter {
    private counters: Map<string, number> = new Map();
    private usedReferences: Set<string> = new Set();

    getNextReference(prefix: string): string {
        let nextRef: string;
        let currentCount = this.counters.get(prefix) || 0;
        
        do {
            currentCount++;
            nextRef = `${prefix}${currentCount}`;
        } while (this.usedReferences.has(nextRef));

        this.counters.set(prefix, currentCount);
        this.usedReferences.add(nextRef);
        return nextRef;
    }

    setReference(reference: string): boolean {
        if (this.usedReferences.has(reference)) {
            return false;
        }
        
        const prefix = reference.match(/^[#]?[a-zA-Z]+/)![0].toLowerCase();
        const number = parseInt(reference.match(/\d+/)![0]);
        
        this.usedReferences.add(reference);
        const currentCount = this.counters.get(prefix) || 0;
        if (number > currentCount) {
            this.counters.set(prefix, number);
        }
        return true;
    }
}
