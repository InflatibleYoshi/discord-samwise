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
2. Setup PersistantVolume Claim in Storage: pv.yaml
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
2. Initialize Vault to secure Bot Token.
https://learn.hashicorp.com/tutorials/vault/kubernetes-minikube
3. Initialize Redis:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/redis
```
4. Unseal Vault
5. Create the environment variables file.
6. Store the environment variables file in Vault
7. Deployment of Helm chart with environment variables file
8. Port forwarding
9. Reseal Vault


