const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('사회정서_주파수온도맞추기.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_text.txt', data.text);
    console.log('PDF text extracted to pdf_text.txt');
}).catch(function(error) {
    console.error('Error parsing PDF:', error);
});
