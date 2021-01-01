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

4. Create Service Account for Application
```


```


5. Create Vault Approle for accessing secrets
```
kubectl exec -it vault-0 -- /bin/sh

vault auth enable approle

vault policy write samwise - <<EOF
path "/samwise/bot/token" {
  capabilities = ["read"]
}
path "/samwise/redis/password" {
  capabilities = ["read"]
}
EOF

vault write auth/approle/role/samwise \
    token_num_uses=2 \
    token_ttl=1h \
    token_max_ttl=1h \
    policies=samwise \
    ttl=24h
```

6. Setup PersistantVolume Claim in Storage: pv.yaml
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
7. Initialize Vault to secure Bot Token.
https://learn.hashicorp.com/tutorials/init/kubernetes-minikube
8. Initialize Redis:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release –set persistence.existingClaim=PVC_NAME bitnami/redis
kubectl get secret --namespace default my-release-redis -o jsonpath="{.data.redis-password}"

Add secret to init.

kubectl delete secret my-release-redis
```
9. Fill Deployment.yml
```
kubectl get pods -o wide
```

10. Unseal Vault

11. Deployment
```
kubectl apply -f deployment.yml
```
12. Reseal Vault
