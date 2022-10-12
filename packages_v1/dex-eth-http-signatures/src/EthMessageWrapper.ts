const MESSAGE_PREFIX = `\x19Ethereum Signed Message:\n`;

export default class EthMessageWrapper {
    
    static wrap(data : string) : string {
        if (data.startsWith(MESSAGE_PREFIX)) {
            throw new Error('refusing to wrap data - already wrapped?')
        }
        return MESSAGE_PREFIX + data.length + data;
    }

    static unwrap(data : string) : string {

        if (! data.startsWith(MESSAGE_PREFIX)) {
            throw new Error('message does not begin with message prefix');
        }

        const withoutPrefix = data.replace(MESSAGE_PREFIX, '');

        let digitCount;
        for(let i = 1; i < withoutPrefix.length; i++) {
            let startingDigits = withoutPrefix.slice(0, i);
            let possibleLength = Number.parseInt(startingDigits);
            if (possibleLength && withoutPrefix.length === possibleLength + i) {
                digitCount = i;
                break;
            }
        }

        if (! digitCount) {
            throw new Error(`data length prefix corrupt`)
        }

        return withoutPrefix.slice(digitCount);
    }
}
