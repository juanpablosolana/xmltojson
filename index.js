const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const CfdiToJson = require("cfdi-to-json");
const { response } = require("express");
var jsonCfdi = null;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

  re=req.query.id
  token=req.query.token
  fetch(`${re}&token=${token}`)
    .then((response) => response.text())
    .then((data) => {
      jsonCfdi = CfdiToJson.parse({
        contentXML: `${data}`,
      })
        fetch(
          `https://cfdiestaus.herokuapp.com/${jsonCfdi.emisor.rfc}&&${jsonCfdi.receptor.rfc}&&${jsonCfdi.total}&&${jsonCfdi.timbreFiscal.uuid}`
        )
          .then((resp) => resp.json())
          .then((data) =>
            res
              .status(200)
              .json(
                `${jsonCfdi.timbreFiscal.uuid.toUpperCase()} | ${
                  jsonCfdi.emisor.rfc
                } | ${jsonCfdi.receptor.rfc} | ${jsonCfdi.total} | ${
                  data["s:Envelope"]["s:Body"]["ConsultaResponse"][
                    "ConsultaResult"
                  ]["a:Estado"]["_text"]
                }`
              )
          );
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log("server corriendo en el puerto", PORT);
});
