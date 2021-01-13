Deployment Steps:
1. Install Kubernetes (I installed microk8s on my RaspberryPis)

2. Setup Storage
```
nano local-storage.yaml

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer

kubectl apply -f local-storage.yaml

kubectl patch storageclass local-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

nano pv-vault.yaml

apiVersion: v1
kind: PersistentVolume
metadata:
  name: vault
  labels:
    type: vault
spec:
  capacity:
    storage: 1Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  local:
    path: /opt/microk8s/vault
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/os
          operator: In
          values:
          - linux
```

3. Install Vault - https://www.vaultproject.io/docs/platform/k8s/helm/examples/standalone-tls

```
nano helm-vault-values.yml

global:
  enabled: true
  tlsDisable: false

server:
  extraEnvironmentVars:
    VAULT_CACERT: /vault/userconfig/vault-server-tls/vault.ca

  extraVolumes:
    - type: secret
      name: vault-server-tls # Matches the ${SECRET_NAME} from above

  dataStorage:
    enabled: true
    size: 1Gi

  standalone:
    enabled: true
    config: |
      listener "tcp" {
        address = "[::]:8200"
        cluster_address = "[::]:8201"
        tls_cert_file = "/vault/userconfig/vault-server-tls/vault.crt"
        tls_key_file  = "/vault/userconfig/vault-server-tls/vault.key"
        tls_client_ca_file = "/vault/userconfig/vault-server-tls/vault.ca"
      }

      storage "file" {
        path = "/vault/data"
      }

injector:
  image:
    repository: "moikot/vault-k8s"
    tag: "0.2.0"
    pullPolicy: IfNotPresent

microk8s helm3 install vault hashicorp/vault --values helm-vault-values.yml --namespace=vault
```

4. Configure Vault  + AppRole for accessing secrets
```
kubectl exec vault-0 --namespace=vault -- vault operator init -key-shares=5 -key-threshold=2 -format=json > cluster-keys.json

kubectl exec -it vault-0 --namespace=vault -- /bin/sh

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
# because hashicorp's documentation told me to do "secret/samwise/bot" instead
# of what I have now

vault token create -policy=samwise -period=30m
# This value provided will give you the correct token to fill into the deployment.yml
```

5. Setup PersistentVolume Claim in Storage: pv.yaml
```
nano pv-redis.yaml

apiVersion: v1
kind: PersistentVolume
metadata:
  name: redis
  labels:
    type: redis
spec:
  capacity:
    storage: 4Gi
  volumeMode: Filesystem
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: local-storage
  local:
    path: /opt/microk8s/redis
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/os
          operator: In
          values:
          - linux

nano pvc-redis.yaml

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

kubectl apply -f pvc-redis.yaml

```
6. Initialize Redis:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release –set persistence.existingClaim=PVC_NAME bitnami/redis
kubectl get secret --namespace default my-release-redis -o jsonpath="{.data.redis-password}"

Add secret to init.

kubectl delete secret my-release-redis
```
7. Fill Deployment.yml with vault-active service ip and redis-master ip.
```
kubectl get pods -o wide
```

8. Unseal Vault

9. Deployment
```
docker build -t discord-samwise .
kubectl apply -f deployment.yml
```
10. Reseal Vault
