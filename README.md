# Anouncement Proxy

Used to show an announcement page before accessing a website, if acknowledged adds a cookie to the browser which prevents the announcement from re-appearing 

## Image name
732469118990.dkr.ecr.ap-northeast-1.amazonaws.com/announcement-proxy:${CI_COMMIT_SHORT_SHA}


## Environment variables

- ANOUNCEMENT: Message to display on the announcement page
- TARGET_BASE_URL: Internal k8s service's URL of the application to proxy to after the message is acknowledged

## Deployment

- Create a deployment with the image above and its ClusterIP service and set it in the same namespace as the website you want to redirect to
- Redirect the ingress to the Announcement's ClusterIP service and at port 3000
