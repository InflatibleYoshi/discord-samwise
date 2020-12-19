Deploying to Production

1. Dockerize Application.
2. Create Deployment - open port 443 TCP for textchat
https://developer.ibm.com/tutorials/convert-sample-web-app-to-helmchart/
3. Deploy Redis Database with Persistent storage.

----------------------Production Ready------------------------------

1. Scale Deployment for multiple pods. 

----------------------Scaling Ready-----------------------------------

Deployment Steps:
1. Install Kubernetes
2. Install Consul {Configuration}
3. Install Vault {Configuration}

2. Create Service Account for Vault Administration
```
vault auth enable kubernetes

vault write auth/kubernetes/config \
        token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
        kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
        kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

vault policy write samwise - <<EOF
path "secret/data/samwise/config" {
  capabilities = ["read"]
}
EOF

vault write auth/kubernetes/role/samwise \
        bound_service_account_names=vault \
        bound_service_account_namespaces=default \
        policies=samwise \
        ttl=24h
``` 

3.


4. Setup PersistantVolume Claim in Storage: pv.yaml
```
nano pv.yaml

  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: kube-storage-8tb
    labels:
      type: local
  spec:
    storageClassName: kube-storage-8tb 
    capacity:
      storage: 2000Gi
    accessModes:
      - ReadWriteOnce 
    persistentVolumeReclaimPolicy: Retain
    hostPath:
      path: "/home/pi/storage/kube-storage" 

$ oc create -f pv.yaml
or
$ kubectl apply -f pv.yaml

  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: redisdb-pvc
  spec:
    storageClassName: ""
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 8Gi
```
5. Initialize Vault to secure Bot Token.
https://learn.hashicorp.com/tutorials/vault/kubernetes-minikube
6. Configure auth method for vault for users/deployments to authenticate.
7. Initialize Redis:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/redis
```
8. Unseal Vault
9. Create the environment variables file.
10. Store the environment variables file in Vault
11. Deployment of Helm chart with environment variables file
12. Port forwarding
13. Reseal Vault


