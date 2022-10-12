const users = require("./users.json");
const userProfile = require("./userProfile.json");

const express = require("express");
const mongodb = require("mongodb").MongoClient;

const app = express();

const port = 5000;

let db;

let connectionString = "mongodb://localhost:27017";

mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    if (err) throw err;
    db = client.db("userinfo");
    app.listen(port, () => {
      console.log("server started");
    });
  }
);

app.use(express.json());

app.get("/", (req, res) => res.end("Hello from server"));

app.post("/create-user", function (req, res) {
  for (var i = 0; i < users.length; i++) {
    let userdetials = userProfile[i];
    db.collection("user").insertOne(
      {
        firstName: users[i].firstName,
        lastName: users[i].lastName,
        email: users[i].email,
        password: users[i].password,
      },
      function (err, info) {
        if (err) throw err;
        else {
          db.collection("usersProfile").insertOne(
            {
              user_id: info.insertedId,
              dob: userdetials.dob,
              mobile_no: userdetials.mobile_no,
            },
            function (err, info) {
              if (err) throw err;
              res.end("data inserted");
            }
          );
        }
      }
    );
  }
});

// finding the average of users 
app.get("/average-age", async(req, res) => {

    let data = await db.collection("usersProfile")
    .find()
    .toArray();

        var totalage = 0;
        var count = 0;

        for(var i = 0;i <data.length;i++){

        let dobDate = data[i].dob;
        let date = new Date(dobDate);
        let today = new Date();
        let currentage = today.getFullYear() - date.getFullYear();
        totalage = totalage + currentage;
        count++;
        }
        var avg = totalage/count;
        console.log(avg);
   
});

//Delete the user whose age is more than 25 years
app.get('/Aged-user', async(req, res)=>{
    let data = await db.collection("usersProfile")
    .find().toArray();

    for(var i = 0;i <data.length;i++){

        let dobDate = data[i].dob;
        let date = new Date(dobDate);
        let today = new Date();
        let currentage = today.getFullYear() - date.getFullYear();
        let userProfileId = data[i]._id;
        if(currentage > 25){
            db.collection("user").deleteOne({_id: data[i].user_id},function(err, info){
                if(err) throw err;
                else{
                    db.collection("usersProfile").deleteOne({_id: userProfileId}, function(err, info){
                        if(err) throw err;
                        console.log("userProfile deleted");
                    });
                }
            });

        }
        }

})


app.get("/get-users", function (req, res) {
  db.collection("user")
    .find()
    .toArray(function (err, items) {
      if (err) throw err;
      res.send(items);
    });
});

app.get("/get-profile", function (req, res) {
  db.collection("usersProfile")
    .find()
    .toArray(function (err, items) {
      if (err) throw err;
      res.send(items);
    });
});