# sGAR application context

This diagram shows the logical connections between the sGAR application and its dependencies. It
does not specify infrastructure, network boundaries or deployment topology.

```mermaid
flowchart LR
    USER(["Users"])

    subgraph IDENTITY["Identity and messaging"]
        direction TB
        ONELOGIN(["GOV.UK One Login"])
        NOTIFY(["GOV.UK Notify"])
    end

    subgraph OPERATIONS["Operational systems"]
        direction TB
        AMG(["AMG"])
        CBP(["CBP"])
        CDLZ(["Common Data Landing Zone"])
    end

    subgraph SGAR["sGAR"]
        direction TB
        S_UI["egar-public-site-ui"]
        S_SESSION[("Postgres: sessions")]
        S_CLAMAV["ClamAV"]
        S_API["data-access-api"]
        S_DB[("Postgres: reports, users and organisations")]
        S_DOCS[("S3: documents")]
        S_CBP_Q[["SQS: CBP queue"]]
        S_CBP["data-integr-cbp"]
        S_CDLZ[("S3: CDLZ handoff")]
        S_AMG_Q[["SQS: AMG queue"]]
        S_GW["gateway-api"]

        S_UI --- S_SESSION
        S_UI -- "scan uploads" --> S_CLAMAV
        S_UI -- HTTP --> S_API
        S_API --- S_DB
        S_API -- read/write --> S_DOCS
        S_API -- "publish GAR" --> S_CBP_Q
        S_CBP_Q --> S_CBP
        S_CBP -- "HTTP read/write" --> S_API
        S_CBP -- read/write --> S_DOCS
        S_CBP -- "best-effort write" --> S_CDLZ
        S_API -- "publish passenger checks" --> S_AMG_Q
        S_AMG_Q --> S_GW
        S_GW -- "HTTP write-back" --> S_API
    end

    USER --> S_UI
    S_UI -- OIDC --> ONELOGIN
    S_UI -- notifications --> NOTIFY
    S_API -- notifications --> NOTIFY
    S_CBP -- notifications --> NOTIFY
    S_GW -- HTTP --> AMG
    S_CBP -- SOAP/XML --> CBP
    S_CDLZ -. handoff .-> CDLZ
```

- sGAR and Online APIS use separate deployed instances of `data-access-api` and `gateway-api`, even
  though they share those codebases. CBP and CDLZ integration is sGAR-only. The Online APIS diagram
  is in `ssar-public-site-ui/docs/application-context.md`.
- Session and report data are shown separately by role; the diagram does not specify whether they
  use separate physical database hosts.
- The dotted CDLZ connection represents a handoff, not a specified transfer mechanism. Confirm
  production resource placement and platform details separately before migration.
