var express = require('express');
var app = express();
app.listen(4001, function () {
    console.log('server running on port 4001');
})

var bibGenerator = require('../../js/bibtex/title2bibtex');

app.get('/test', callTest);
function callTest(req, res) {
    bibGenerator.title2bibtex(req.query.title, res);
}

// query: http://localhost:4001/test?title=annotation%20jinki%20jung

// expected result: @inproceedings{lee2019annotation, title={Annotation vs. Virtual Tutor: Comparative Analysis on the Effectiveness of Visual Instructions in Immersive Virtual Reality}, author={Lee, Hyeopwoo and Kim, Hyejin and Monteiro, Diego Vilela and Goh, Youngnoh and Han, Daseong and Liang, Hai-Ning and Yang, Hyun Seung and Jung, Jinki}, booktitle={2019 IEEE International Symposium on Mixed and Augmented Reality (ISMAR)}, pages={318--327}, year={2019}, organization={IEEE} }