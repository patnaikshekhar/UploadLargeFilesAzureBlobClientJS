const {
  SharedKeyCredential,
  generateBlobSASQueryParameters,
  SASProtocol
} = require('@azure/storage-blob')

const CONTAINER_NAME = process.env.AZ_CONTAINER_NAME
const ACCOUNT_NAME = process.env.AZ_ACCOUNT_NAME
const ACCOUNT_KEY = process.env.AZ_ACCOUNT_KEY

const getSAS = (filename) => {
    const sharedKeyCredential = new SharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY)

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5)
    
    const params = generateBlobSASQueryParameters({
        protocol: SASProtocol.HTTPS,
        containerName: CONTAINER_NAME,
        blobName: filename,
        expiryTime: expiryTime,
        permissions: filename ? 'r' : 'arwl'
    }, sharedKeyCredential)

    return {
        uri: filename ? 
            `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${filename}` :
            `https://${ACCOUNT_NAME}.blob.core.windows.net`,
        params: params.toString()
    }
}

module.exports = {
    getSAS
}