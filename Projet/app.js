const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
var dateFormat = require('dateformat');
const passport = require('passport')
const session = require('express-session');
const flash = require('connect-flash');
var mysql = require('mysql');
var fs = require('fs');
var async = require("async");
//import {PythonShell} from 'python-shell';
const ps = require("python-shell");
let options = {
  mode: 'text',
pythonPath: 'C:\\Users\\lamsy\\AppData\\Local\\Programs\\Python\\Python37-32\\python',
  //pythonOptions: ['-u'], // cette ligne cause probleme daffichage des resultats
  scriptPath: './',
  //args: ['value1', 'value2', 'value3'],
  encoding: 'utf8'
};
const { ensureAuthenticated } = require('./helpers/auth')

//port
const port = 4000;
app.listen(port, () => {
  console.log('Server Started on port ' + port);
});

//database connection
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "elmehdi78",
  database: "bibliotech",
  multipleStatements: true

});


con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to Mysql database !");

});

app.use('/couverture_livre', express.static(__dirname + '/couverture_livre'));

//handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

const bodyParser = require('body-parser');
//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//passport config
require('./config/passport')(passport);


//Expression session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(flash());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Global variables 
var req;
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.login_msg = req.flash('login_msg');
  res.locals.matricule_unique = req.flash('matricule_unique');
  res.locals.cin_unique = req.flash('cin_unique');
  res.locals.succes_ajout = req.flash('succes_ajout');
  res.locals.voiture_supp = req.flash('voiture_supp');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.alert_msg = req.flash('alert_msg');


  res.locals.user = req.user || null;

  next();
})







//Acceuil Route
app.get('/BiblioTech', (req, res) => {
  if (res.locals.user != null) {
    var session = "1"
  }
  var req1 = "SELECT Distinct catégorie FROM livre";
  var req2 = "SELECT * FROM livre ORDER BY nbre_vendu DESC limit 8";
  var req3 = "SELECT * FROM livre ORDER BY date_parution DESC limit 3";


  con.query(
    req1,
    function select(error, res1, fields) {
      if (error) {
        console.log(error);
        con.end();
        return;
      }
      data1 = new Array();
      j = 0;
      while (j < res1.length) {

        data1.push(res1[j]);
        j++;
      }
      con.query(
        req2,
        function select(error, res2, fields) {
          if (error) {
            console.log(error);
            con.end();
            return;
          }
          data2 = new Array();
          j = 0;
          while (j < res2.length) {
            res2[j].date_parution = dateFormat(res2[j].date_parution, "dd/mm/yyyy")

            data2.push(res2[j]);
            j++;
          }
          con.query(
            req3,
            function select(error, res3, fields) {
              if (error) {
                console.log(error);
                con.end();
                return;
              }
              data3 = new Array();
              j = 0;
              while (j < res3.length) {

                data3.push(res3[j]);
                j++;
              }
              console.log("Route Acceuil")
              res.render('acceuil', { data1: data1, data2: data2, data3: data3, session: session });
            })
        })
    })
})


//Catégorie Route
app.get('/categorie/:categorie', (req, res) => {
  if (res.locals.user != null) {
    var session = "1"
  }
  var req1 = "SELECT Distinct catégorie FROM livre";
  con.query(
    req1,
    function select(error, res1, fields) {
      if (error) {
        console.log(error);
        con.end();
        return;
      }
      data1 = new Array();
      j = 0;
      while (j < res1.length) {

        data1.push(res1[j]);
        j++;
      }
      var req2 = "SELECT * FROM livre WHERE catégorie='" + req.params.categorie + "'";
      con.query(
        req2,
        function select(error, res2, fields) {
          if (error) {
            console.log(error);
            con.end();
            return;
          }
          data2 = new Array();
          j = 0;
          while (j < res2.length) {
            res2[j].date_parution = dateFormat(res2[j].date_parution, "dd/mm/yyyy")
            data2.push(res2[j]);
            j++;
          }
          console.log("Route catégorie")
          res.render('catégorie', { data2: data2, data1: data1, session: session });
        })
    })
})

//Fiche Technique Route
app.get('/fichetechnique/:categorie/:id_livre', (req, res) => {
  if (res.locals.user != null) {
    var session = "1"
    fichier_python='user_filtr_coll.py'
  }
  else {
    fichier_python='livre_filtr_coll.py'
  }
    ps.PythonShell.run(fichier_python, options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution
      var req1 = "SELECT Distinct catégorie FROM livre";
      con.query(
        req1,
        function select(error, res1, fields) {
          if (error) {
            console.log(error);
            con.end();
            return;
          }
          data1 = new Array();
          j = 0;
          while (j < res1.length) {

            data1.push(res1[j]);
            j++;
          }

          i = 0,
          //console.log(results)
          data_recom = new Array()
          if (res.locals.user != null) {
            while (i < results[res.locals.user.id_utilisateur].length) {
              data_recom.push(parseInt(results[res.locals.user.id_utilisateur][i]))
              console.log(results[res.locals.user.id_utilisateur][i])

              i++;
          }
        }
          else{
            while (i < results[req.params.id_livre].length) {
              data_recom.push(parseInt(results[req.params.id_livre][i]))
              i++;
            }
          }
      //console.log(results)
        i = 0,
          data_recom1 = new Array()
        while (i < data_recom.length) {
          if ((data_recom[i] == 0 || data_recom[i] == 1 || data_recom[i] == 2 || data_recom[i] == 3 || data_recom[i] == 4 || data_recom[i] == 5 || data_recom[i] == 6 || data_recom[i] == 7 || data_recom[i] == 8 || data_recom[i] == 9)) {
            if ((data_recom[i + 1] == 0 || data_recom[i + 1] == 1 || data_recom[i + 1] == 2 || data_recom[i + 1] == 3 || data_recom[i + 1] == 4 || data_recom[i + 1] == 5 || data_recom[i + 1] == 6 || data_recom[i + 1] == 7 || data_recom[i + 1] == 8 || data_recom[i + 1] == 9)) {
              data_recom1.push(parseInt(data_recom[i] + '' + data_recom[i + 1]))
              i = i + 2
            }
            else { data_recom1.push(data_recom[i]), i++ }
          }
  
          else { i++ }
  
  
        }
       // console.log('results:', data_recom1);

          var req2 = "SELECT * FROM livre WHERE id_livre='" + req.params.id_livre + "'";
          var req3 = "SELECT * FROM livre WHERE catégorie='" + req.params.categorie + "' AND id_livre<>'" + req.params.id_livre + "' ORDER BY nbre_etoiles DESC limit 4";
          if (res.locals.user != null) {
            var req4 = "SELECT * FROM livre WHERE id_livre IN (" + data_recom1[2]+","+data_recom1[3]+","+data_recom1[4]+"," +data_recom1[5]+")"
          }
          else{ 
          var req4 = "SELECT * FROM livre WHERE id_livre IN (" + data_recom1[1]+","+data_recom1[2]+","+data_recom1[3]+"," +data_recom1[4]+")";
        } 
          con.query(
            req2,
            function select(error, res2, fields) {
              if (error) {
                console.log(error);
                con.end();
                return;
              }
              data2 = new Array();
              j = 0;

              while (j < res2.length) {
                res2[j].date_parution = dateFormat(res2[j].date_parution, "dd/mm/yyyy")
                data2.push(res2[j]);
                j++;
              }
              con.query(
                req3,
                function select(error, res3, fields) {
                  if (error) {
                    console.log(error);
                    con.end();
                    return;
                  }
                  data3 = new Array();
                  j = 0;
                  while (j < res3.length) {
                    data3.push(res3[j]);
                    j++;
                  }
                  console.log("Route Fiche Technique")
                  con.query(
                    req4,
                    function select(error, res4, fields) {
                      if (error) {
                        console.log(error);
                        con.end();
                        return;
                      }
                      data4= new Array();
                      j = 0;
                      while (j < res4.length) {
                        data4.push(res4[j]);
                        j++;
                      }
                  res.render('FicheTechnique', { data2: data2, data1: data1, data3: data3,data4:data4, session: session });
                    })
                })
            })
        })
     
    });
  

})


//Authentification
app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: 'back',
    failureRedirect: 'back',
    failureFlash: true


  })(req, res, next);



})

//Deconnexion Route
app.get('/deconnexion', (req, res) => {

  req.logOut();
  console.log('vous etes deconnecté')

  res.redirect('back');
})

//achat route
app.get('/achat/:categorie/:id_livre', (req, res) => {

  var req1 = "SELECT * FROM achat_livre Where foreign_idlivre='" + req.params.id_livre + "' AND foreign_utilisateur='" + res.locals.user.id_utilisateur + "' ";


  con.query(
    req1,
    function select(error, res1, fields) {
      if (error) {
        console.log(error);
        con.end();
        return;
      }

      if (res1.length == 0) {
        var sql = "INSERT INTO achat_livre ( foreign_idlivre,foreign_utilisateur ) VALUES ('" + req.params.id_livre + "','" + res.locals.user.id_utilisateur + "');";
        con.query(
          sql,
          function select(error, res2, fields) {
            if (error) {
              console.log(error);
              con.end();
              return;
            }
          })
      }
    })



  console.log('livre note' + req.params.id_livre)
  var req1 = "SELECT * FROM livre Where id_livre='" + req.params.id_livre + "'";


  con.query(
    req1,
    function select(error, res1, fields) {
      if (error) {
        console.log(error);
        con.end();
        return;
      }
      data1 = new Array();
      j = 0;
      while (j < res1.length) {

        data1.push(res1[j]);
        j++;
      }
      res1[0].nbre_vendu = res1[0].nbre_vendu + 1
      var req2 = "UPDATE livre SET nbre_vendu='" + res1[0].nbre_vendu + "' Where id_livre='" + req.params.id_livre + "'";
      con.query(
        req2,
        function select(error, res2, fields) {
          if (error) {
            console.log(error);
            con.end();
            return;
          }
        })

      req.flash('succes_ajout', 'Livre aimer.')

      res.redirect('back');

    })

})

//Note Route
app.post('/note/:id_livre', (req, res) => {
  if (res.locals.user == null) {
    req.flash('matricule_unique', 'Vous devez vous connecter')
    res.redirect('back');

  }
  else {
    if (req.body.note == null) {
      req.flash('matricule_unique', "Vous n'avez pas inséré de Note.")
      res.redirect('back');
    }
    else {
      if (req.body.note > 5 || req.body.note < 0) {
        req.flash('matricule_unique', 'La note doit etre comprise entre 0 et 5')
        res.redirect('back');
      }
      else {
        var req1 = "SELECT * FROM notes_livre Where foreign_livre='" + req.params.id_livre + "' AND foreign_utilisateur='" + res.locals.user.id_utilisateur + "' ";


        con.query(
          req1,
          function select(error, res1, fields) {
            if (error) {
              console.log(error);
              con.end();
              return;
            }

            if (res1.length == 0) {
              var sql = "INSERT INTO notes_livre (note, foreign_livre,foreign_utilisateur ) VALUES ('" + req.body.note + "','" + req.params.id_livre + "','" + res.locals.user.id_utilisateur + "');";
            }
            else {
              var sql = "UPDATE notes_livre SET note='" + req.body.note + "' Where id_notes_livre='" + res1[0].id_notes_livre + "'";
            }
            con.query(
              sql,
              function select(error, res2, fields) {
                if (error) {
                  console.log(error);
                  con.end();
                  return;
                }
                var req3 = "SELECT  SUM(note) AS note_mean FROM notes_livre Where foreign_livre='" + req.params.id_livre + "'";
                con.query(
                  req3,
                  function select(error, res3, fields) {
                    if (error) {
                      console.log(error);
                      con.end();
                      return;
                    }
                    var req4 = "SELECT  * FROM notes_livre Where foreign_livre='" + req.params.id_livre + "'";
                    con.query(
                      req4,
                      function select(error, res4, fields) {
                        if (error) {
                          console.log(error);
                          con.end();
                          return;
                        }
                        note_moyenne = res3[0].note_mean / res4.length;

                        var req5 = "UPDATE livre SET nbre_etoiles='" + note_moyenne + "' Where id_livre='" + req.params.id_livre + "'";
                        con.query(
                          req5,
                          function select(error, res5, fields) {
                            if (error) {
                              console.log(error);
                              con.end();
                              return;
                            }
                            req.flash('succes_ajout', 'Note ajoutée.')
                            res.redirect('back');
                          })
                      })
                  })

              })

          })

      }

    }
  }

})

