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
2. Install Vault
```
helm install vault hashicorp/vault --set server.standalone.enable=true

```

3. Create Vault AppRole for accessing secrets
```
kubectl exec -it vault-0 -- /bin/sh

vault auth enable approle

vault policy write samwise - <<EOF
path "samwise/redis" {
  capabilities = ["read"]
}

path "samwise/bot" {
  capabilities = ["read"]
}
EOF
# The above policy was formed through much trial and error and much blood, sweat, and tears 
# because hashicorp's dogshit documentation told me to do "secret/samwise/bot" instead
# of what I have now

vault token create -policy=samwise -period=30m
# This value provided will give you the correct token to fill into the deployment.yml
```

4. Setup PersistentVolume Claim in Storage: pv.yaml
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
5. Initialize Redis:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release –set persistence.existingClaim=PVC_NAME bitnami/redis
kubectl get secret --namespace default my-release-redis -o jsonpath="{.data.redis-password}"

Add secret to init.

kubectl delete secret my-release-redis
```
6. Fill Deployment.yml with vault-active service ip and redis-master ip.
```
kubectl get pods -o wide
```

7. Unseal Vault

8. Deployment
```
docker build -t discord-samwise .
kubectl apply -f deployment.yml
```
9. Reseal Vault
