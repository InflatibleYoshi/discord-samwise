Deploying to Production

1. Dockerize Application.
2. Create Deploy - open port 443 TCP for textchat
https://developer.ibm.com/tutorials/convert-sample-web-app-to-helmchart/
3. Deploy Redis Database with Persistent storage.
4. Initialize Vault to secure Bot Token.
https://learn.hashicorp.com/tutorials/vault/kubernetes-minikube

----------------------Production Ready------------------------------

1. Figure out Eris Fleet for Application
2. Scale Deployment for multiple pods. 

----------------------

Deployment Steps:

1. Unseal Vault
2. Deployment of Helm chart
3. Run Application with the Token
4. Reseal Vault


