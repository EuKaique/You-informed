module.exports = {
    eAdmin: function(req, res, next){
        
        //Verifica se o usuário está logado
        //Se eAdmin for igual a 1 é administrador
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }

        //req.flash("error_msg", "Você precisa ser um Administrador!")
        res.redirect("/")

    }
}