const sanitizeHTML = require('sanitize-html')
var template = {
    head: ``,

    setHeader: function (content) {
        // console.log(content)
        this.head = `<h1>${content}</h1>`
        //console.log('this head:',this.head)

    },
    getHtml: function (content) {

        return this.head +
            `
            <div>
            ${content}
            </div>
        `
    },
    cleanHTML: function (content) {
        return sanitizeHTML(content)
    }

}

module.exports = template