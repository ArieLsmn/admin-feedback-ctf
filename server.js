const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const port = 3075;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

let feedback = "";
 
app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Node.js"); //SCENARIO75{Node.js}

    if (!req.cookies.pre_mfa_session) {

        res.cookie(
            "pre_mfa_session", //SCENARIO75{pre_mfa_session}
            "pending_mfa_verification", //SCENARIO75{pending_mfa_verification}
            {
                httpOnly: false //SCENARIO75{False}
            }
        );
    }

    next();
});

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


//SCENARIO75{POST}

app.post("/feedback", (req, res) => {

    const msg = req.body.message || "";


    if (
        msg.toLowerCase().includes("<script") ||
        msg.toLowerCase().includes("document.cookie")
    ) {
		//SCENARIO75{403}
        return res.status(403).send(`
		<!DOCTYPE html>
<html>
<head>
    <title>403 Forbidden</title>
</head>
<body>
    <center>
        <h1>403 Forbidden</h1>
        <hr>
        <p>Access denied by Web Application Firewall.</p>
    </center>
</body>
</html>`
		); 
    }

    feedback = msg;

    res.send("Feedback received.");
});


//SCENARIO75{/api/verify-mfa}

app.get("/api/verify-mfa", (req, res) => {

res.json({
    endpoint: "/api/verify-mfa",
    status: "MFA required",
    next: "/dashboard"
});

});

app.post("/api/verify-mfa", (req, res) => {

//SCENARIO75{adm_sess}

res.cookie(
    "adm_sess_cookie",
    "adm_sess_super_admin",
    {
        httpOnly: false
    }
);

res.json({
    success: true,
    redirect: "/dashboard"
});

});


app.get("/admin-review", (req, res) => {

    res.cookie(
        "adm_sess_cookie",
        "adm_sess_super_admin",
        {
            httpOnly: false
        }
    );

    
	res.send(`
    <h1>Admin Review Queue</h1>

    <p>
        Internal Note:
        New client-side fetcher API deployed.
    </p>

    ${feedback}
	`);

});



//SCENARIO75{fetch}

let telemetryLogs = [];

app.post("/api/collect", (req, res) => {

    const entry = {
        timestamp: new Date().toISOString(),
        data: req.body
    };

    telemetryLogs.push(entry);

    console.log("[FETCH RECEIVED]");
    console.log(entry);

    res.json({
        success: true,
        flag: "SCENARIO75{fetch}"
    });
});

app.get("/adminlogs", (req, res) => {
	

    let html = `
        <h1>Telemetry Logs</h1>
        <hr>
    `;

    telemetryLogs.forEach((log, index) => {

        html += `
            <h3>#${index + 1}</h3>

            <pre>
${JSON.stringify(log, null, 2)}
            </pre>

            <hr>
        `;
    });

    res.send(html);
});



//SCENARIO75{/dashboard}

app.get("/dashboard", (req, res) => {

const session =
    req.cookies.adm_sess_cookie || "";

if (session.startsWith("adm_sess")) {

    
    return res.send(`
        <h1>Administrative Dashboard</h1>

        <p>Welcome administrator.</p>

		<!--SCENARIO75{xss-payload})-->
        <div class="xss-payload">
            ${feedback}
        </div>

        <hr>

        <h3>Victory Flag</h3>

        <p>
            SCENARIO75{RED_C00k13_MFA_Byp4ss_0wn3d}
        </p>
    `);
}

res.status(401).send(`
    <h1>401 Unauthorized</h1>

    <p>
        MFA verification required.
    </p>

    <p>
        Visit /api/verify-mfa first.
    </p>
`);

});

app.listen(port, () => {
    console.log(`Running on port ${port}`);
});