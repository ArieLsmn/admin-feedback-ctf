const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(
__dirname,
"opt",
"admin",
"logs"
);

fs.mkdirSync(LOG_DIR, {
recursive: true
});

const accessLog = path.join(
LOG_DIR,
"access.log"
);

const errorLog = path.join(
LOG_DIR,
"error.log"
);

/*
Blue Team flags embedded in logs:

SCENARIO75{/opt/admin/logs}
SCENARIO75{10.10.14.50}
SCENARIO75{Mozilla/5.0}
SCENARIO75{200}
SCENARIO75{18:51:55}
SCENARIO75{UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0}
SCENARIO75{192.168.1.100}
SCENARIO75{10.10.14.0/24}
SCENARIO75{/opt/admin/logs/error.log}
SCENARIO75{<script>}
SCENARIO75{18:50:15}
SCENARIO75{No}
SCENARIO75{Base64}
SCENARIO75{44}
SCENARIO75{CRITICAL}
SCENARIO75{18:53:10}
SCENARIO75{Authentication bypass anomaly}
*/

const accessEntries = [

`192.168.1.100 - - [15/Jul/2025:18:49:00 +0000] "GET /dashboard HTTP/1.1" 200 3421 "-" "Mozilla/5.0"`,

`192.168.1.100 - - [15/Jul/2025:18:49:30 +0000] "GET /admin-review HTTP/1.1" 200 1820 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:50:05 +0000] "GET / HTTP/1.1" 200 1201 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:50:08 +0000] "GET /robots.txt HTTP/1.1" 200 93 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:50:10 +0000] "GET /dashboard HTTP/1.1" 401 93 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:50:20 +0000] "POST /feedback HTTP/1.1" 403 25 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:50:45 +0000] "POST /feedback HTTP/1.1" 200 18 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:51:05 +0000] "GET /admin-review HTTP/1.1" 200 1820 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:51:15 +0000] "GET /analytics HTTP/1.1" 200 511 "-" "Mozilla/5.0"`,

`10.10.14.50 - - [15/Jul/2025:18:51:55 +0000] "GET /dashboard HTTP/1.1" 200 4048 "-" "Mozilla/5.0" "X-Forwarded-For: UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0"`

];

const errorEntries = [

`[18:50:15] WAF: blocked payload containing <script> from IP 10.10.14.50`,

`[18:51:58] CRITICAL: Cookie reuse detected from IP 10.10.14.50 using adm_sess_cookie`,

`[18:53:10] WARNING: Authentication bypass anomaly`

];

fs.writeFileSync(
accessLog,
accessEntries.join("\n") + "\n"
);

fs.writeFileSync(
errorLog,
errorEntries.join("\n") + "\n"
);

console.log(
"Logs generated:"
);

console.log(accessLog);
console.log(errorLog);
