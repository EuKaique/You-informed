const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Noticia");
const Noticia = mongoose.model("noticias");
const { eAdmin } = require("../helpers/eAdmin");

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("Página de posts");
});

//Lista de categorias
router.get("/categorias", eAdmin, (req, res) => {
  //Listar todas as categorias
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((error) => {
      //req.flash("error_msg", "Houve um erro ao listar as categorias.");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

//Salvar Categoria no banco
router.post("/categorias/nova", eAdmin, (req, res) => {
  var erros = [];

  //Validação do formulário
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Slug inválido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "O nome da categoria é muito pequeno." });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        //req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((error) => {
        /*
        req.flash(
          "error_msg",
          "Houve um erro ao salvar a categoria, tenta novamente!"
        );
        */
        res.redirect("/admin");
      });
  }
});

//Editar categoria
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((error) => {
      //req.flash("error_msg", "Essa categoria não existe.");
      res.redirect("/admin/categorias");
    });
});

//Salvar a edição da categoria
router.post("/categorias/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      (categoria.nome = req.body.nome), (categoria.slug = req.body.slug);

      categoria
        .save()
        .then(() => {
         // req.flash("success_msg", "Categoria editada com sucesso!");
          res.redirect("/admin/categorias");
        })
        .catch((error) => {
          /*
          req.flash(
            "error_msg",
            "Houve um erro interno ao salvar a edição da categoria."
          );
          */
          res.redirect("/admin/categorias");
        });
    })
    .catch((error) => {
     // req.flash("error_msg", "Houve um erro ao editar categoria.");
      res.redirect("/admin/categorias");
    });
});

//Deletar categoria
router.post("/categorias/deletar", eAdmin, (req, res) => {
  //id vindo do formulario em método post
  Categoria.remove({ _id: req.body.id })
    .then(() => {
     // req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((error) => {
     // req.flash("error_msg", "Houve um erro ao deletar categoria.");
      res.redirect("/admin/categorias");
    });
});

//Listagem de noticias
router.get("/noticias", eAdmin, (req, res) => {
  Noticia.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((noticias) => {
      res.render("admin/noticias", { noticias: noticias });
    })
    .catch((error) => {
      //req.flash("error_msg", "Houve um erro ao listar as noticias." + error);
      res.redirect("/admin");
    });
});

//Tela de cadastro de Noticia
router.get("/noticias/add", eAdmin, (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addNoticia", { categorias: categorias });
    })
    .catch((error) => {
      //req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});

//Salvar dados da criação da Noticia no banco
router.post("/noticias/nova", eAdmin, (req, res) => {
  var erros = [];

  if (req.body.categoria === "0") {
    erros.push({ texto: "Categoria inválida, registra uma categoria" });
  }

  if (erros.length > 0) {
    //mostrar na tela, caso dê algum tipo de erro
    res.render("admin/addNoticia", { erros: erros });
  } else {
    const novaNoticia = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      imagem: req.body.imagem,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      autor: req.body.autor
    };

    console.log(novaNoticia);

    new Noticia(novaNoticia)
      .save()
      .then(() => {
        //req.flash("success_msg", "Noticia criada com sucesso.");
        res.redirect("/admin/noticias");
      })
      .catch((error) => {
        /*
        req.flash(
          "error_msg",
          "Houve um erro ao cadastrar Noticia, tente novamente."
        );
        */
        res.redirect("/admin/noticias");
      });
  }
});

//Página de edição da Noticia
router.get("/noticias/edit/:id", eAdmin, (req, res) => {
  //Buscar em seguidas
  Noticia.findOne({ _id: req.params.id })
    .then((Noticia) => {
      Categoria.find()
        .then((categorias) => {
          res.render("admin/editNoticias", {
            categorias: categorias,
            Noticia: Noticia,
          });
        })
        .catch(() => {
          req.flash("error_msg", "Houve um erro ao listar as categorias."); 
          res.redirect("/admin/noticias");
        })
    .catch(() => {
      /*
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição."
      );
      */
      res.redirect("/admin/noticias");
    });
    });
  });  

//Salvar a edição da Noticia
router.post("/noticia/edit", eAdmin, (req, res) => {
  Noticia.findOne({ _id: req.body.id })
    .then((Noticia) => {
      (Noticia.titulo = req.body.titulo),
        (Noticia.slug = req.body.slug),
        (Noticia.descricao = req.body.descricao),
        (Noticia.imagem = req.body.imagem),
        (Noticia.conteudo = req.body.conteudo),
        (Noticia.categoria = req.body.categoria),
        (Noticia.autor = req.body.autor);

      Noticia.save()
        .then(() => {
         // req.flash("success_msg", "Noticia editada com sucesso.");
          res.redirect("/admin/noticias");
        })
        .catch((error) => {
         // req.flash("error_msg", "Houve um erro ao editar a Noticia.");
          res.redirect("/admin/noticias");
        });
    })
    .catch((error) => {
      console.log(error);
      //req.flash("error_msg", "Houve um erro ao salvar a edição.");
      res.redirect("/admin/noticias");
    });
});

//


//Excluir Noticia
router.get("/noticias/deletar/:id", eAdmin, (req, res) => {
  Noticia.remove({ _id: req.params.id })
    .then(() => {
      //req.flash("error_msg", "Noticia deletada com sucesso.");
      res.redirect("/admin/noticias");
    })
    .catch((error) => {
      //req.flash("error_msg", "Houve um erro interno.");
      res.redirect("/admin/noticias");
    });
  });

module.exports = router;
