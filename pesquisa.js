const express = require('express');
const router = express.Router();
 
function simplify(text){
    const separators = /[s,.;:()-'+]/g;
    const diacritics = /[u0300-u036f]/g;
    //capitalização e normalização
    text = text.toUpperCase().normalize("NFD").replace(diacritics, "");
    //separando e removendo repetidos
    const arr = text.split(separators).filter((item, pos, self) => self.indexOf(item) == pos);
    console.log(arr);
    //removendo nulls, undefineds e strings vazias
    return arr.filter(item => (item));
}
 
/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.Noticia.q)
    return res.render('index', {noticias: [], query: '' });
  else {
    const Noticia = simplify(req.Noticia.q);
    const mongoClient = require("mongodb").MongoClient;
    mongoClient.connect("mongodb://localhost:8081")
               .then(conn => conn.db("Banco_kaiqueDB"))
               .then(db => db.collection("Noticia").find({tags: {$all: Noticia }}))
               .then(cursor => cursor.toArray())
               .then(noticias => {
                 return res.render('index', {noticias, query: req.Noticia.q});
               })
  }
});
 
module.exports = router;