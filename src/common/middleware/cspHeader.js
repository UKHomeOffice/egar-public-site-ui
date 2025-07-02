import crypto from "node:crypto";

export const styleSrc = ["'self'"];

export const cspReportingHeader = (_req, res, next) => {
    
    const nonce = crypto.randomBytes(16).toString("base64");
    res.cspNonce = nonce;
    const scriptSrc = [
        "'self'",
        "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='", //TODO change this
        "'sha384-pgQaOX4XVLz+ULrPIlTuJe6EIQSDptm5tBSJh6ukBI3O9Bej5Su0ufNQTdmOWoYy'",//This is supposed to be a sha for jquery, dosnt seem to work
        "https://ajax.googleapis.com/",//This is a quick bodge for the above
        "https://www.googletagmanager.com/",//More bodge
        "'nonce-"+nonce+"'",
    ]

    var BASE_URL = "localhost"//TODO change this for actual env value
    res.set(
        'Reporting-Endpoints',
        `csp-endpoint="https://${BASE_URL}/_/cspreports`,
    );
    const reporting =
        process.env.NODE_ENV === 'production'
        ? 'report-to csp-endpoint'
        : 'report-uri /_/cspreports';
    const contentSecurityReportingPolicy =
        `default-src 'self';` +
        `base-uri 'self';` +
        `font-src 'self' https: data:;` +
        `form-action 'self';` +
        `frame-ancestors 'self';` +
        `img-src 'self' data:;` +
        `object-src 'none';` +
        `script-src ${scriptSrc.join(' ')};` +
        `script-src-attr 'none';` +
        `style-src ${styleSrc.join(' ')};` +
        `upgrade-insecure-requests;${reporting}`;
    res.set(
        'Content-Security-Policy-Report-Only',
        contentSecurityReportingPolicy,
    );
    next();
};
