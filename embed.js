export function Error(command, text) {
    return embedGenerator(sentenceTruncation(text), color.RED, command)
}
export function Command(command, text) {
    return embedGenerator(sentenceTruncation(text), color.YELLOW, command)
}
export function Response(command, text) {
    return embedGenerator(sentenceTruncation(text), color.GREEN, command)
}
export function Alert(username, text) {
    return embedGenerator(sentenceTruncation(text), color.ORANGE, username)
}

const embed = {
    RED: 16711680,
    YELLOW: 16776960,
    GREEN: 65280,
    ORANGE: 16745472
}

function sentenceTruncation(paragraph){
    let chars = 0;
    let subsections = [];
    var section = '';
    for (sentence of paragraph.split('.').map(x => x + '.')){
        chars += sentence.length;
        if(chars > 999){
            subsections.push(section.trim());
            section = sentence;
            chars = sentence.length;
        } else {
            section = section + sentence;
        }
    }
    subsections.push(section.trim());
    return subsections;
}

function embedGenerator(subsections, colorcode, title) {
    let textfields = [{
        "name": `${title}`,
        "value": `${subsections[0]}`
    }]
    for(subsection of subsections.slice(1,)) {
        textfields.push({
            "name": "Ƹ̵̡Ӝ̵̨̄Ʒ",
            "value": subsection
        });
    }
    const embed = {
        "embed": {
            "color": colorcode,
            "fields": textfields
        }
    };
    return embed;
}