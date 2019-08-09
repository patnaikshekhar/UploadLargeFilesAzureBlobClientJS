const containerName = 'bigfiles'

// fetchSAS fetches the SAS token from the server to authenticate
function fetchSAS(filename) {
    return fetch('/sas', {
        method: 'POST',
        body: JSON.stringify({
            filename: filename
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(res => res.json())
      .then(res => {
        if (!filename) {
            return AzureStorage.Blob.createBlobServiceWithSas(
                res.uri, 
                res.params
            )
        } else {
            return `${res.uri}?${res.params}`
        }
      })
}

// openModal shows the file upload progress dialog
function openModal(yes) {
    const elems = document.querySelectorAll('.modal')
    const instances = M.Modal.init(elems)

    if (yes) {
        instances[0].open()
    } else {
        instances[0].close()
    }
}

// Start loads the set of Blobs in the container in Azure
function start() {
    fetchSAS()
        .then(service => {
            service.listBlobsSegmented(containerName, null, function (error, results) {
                if (error) {
                    console.error(error)
                } else {
                    generateFileCards(results.entries)
                }
            })
        })
        .catch(e => console.error(e))
}

// generateFileCards generates a card for each file to display on the UI
function generateFileCards(blobs) {
    
    const innerHTML = blobs.map(blob => {
        return `
        <div class="col s12 m4">
            <div class="card blue-grey darken-1">
            <div class="card-content white-text">
                <span class="card-title">${blob.name}</span>
                <p class="size">${bytesToSize(blob.contentLength)}</p>
            </div>
            <div class="card-action">
                <a href="#" data-filename="${blob.name}" onclick="downloadFile(event)">Download</a>
            </div>
            </div>
        </div>
        `
    })

    document.getElementById('rows').innerHTML = innerHTML.join('')
    
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// fileUpload uploads the file to storage
function fileUpload() {
    const file = document.querySelector('#fileInput').files[0]
    
    openModal(true)
    document.getElementById('modalFileName').innerText = file.name

    fetchSAS()
        .then(service => {
            const summary = service.createBlockBlobFromBrowserFile(
                containerName,
                file.name,
                file,
                (error) => {
                    if(error) {
                        console.error(error)
                    } else {
                        location.reload()
                    }
                })


            summary.on('progress', () => {
                document.getElementById('modalPercentageProgress').innerText = summary.getCompletePercent()
                document.querySelector('.determinate').style.width = parseInt(summary.getCompletePercent()) + '%'
            })
        })
        .catch(e => console.error(e))
}

function downloadFile(e) {

    const filename = e.target.dataset.filename
    
    fetchSAS(filename)
        .then(uri => {
            console.log(uri)
            document.location = uri
        })
        .catch(e => console.error(e))
}

start()