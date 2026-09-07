const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger/swagger.yaml");

module.exports = (app) => {

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
            explorer: true,
            customSiteTitle: "ORGOS Authentication API",
            swaggerOptions: {
                persistAuthorization: true
            }
        })
    );

};