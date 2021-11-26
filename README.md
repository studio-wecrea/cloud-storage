# Cloud-Storage Library

This library helps your NodeJS project to communicate with Openstack at OVH, Scaleway or another S3 cloud storage !

## Installation

Add the lib to your package.json file :

```bash
npm instal --save wecrea/cloud-storage
```

## Usage

SUMMARY

### Connection

```javascript
const { CloudStorage } = await import("cloud-storage");

try {
  const Storage = new CloudStorage({
    type: "ovh",
    host: "https://auth.cloud.ovh.net/v3/auth",
    access: "user-abc123def456",
    secret: "RaNdOmSeCr3tP4SsPHr4s3",
    project: "RaNdOmPr0j3CtId",
    region: "ABC",
    localpath: "/your/directory",
  });
  const OVHStorage = await Storage.connect();
  // Perfect, you are connected and you can use OVHStorage object
} catch (e) {
  // your code here...
}
```
