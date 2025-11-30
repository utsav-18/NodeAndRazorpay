const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"public")));


app.get("/new" , (req,res) => {
    res.render("index.ejs");
});

app.listen(port , () =>{
    console.log("http://localhost:3000/new");
}); 