# eGAR public site AWS service account setup

No runtime AWS SDK or AWS service call was found in the public site UI pod code or Kubernetes deployment. The AWS credentials in the Drone file are used for image publishing, not by the application pod.

Do not create an AWS Pod Identity role for this pod unless a future feature adds an AWS API call. If that happens, define the exact service and resource permissions first, then add a dedicated service account and role rather than granting broad AWS access.
