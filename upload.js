const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    console.log(file);
    return
    
    
    if (!file) {
        alert('请选择文件');
        return;
    }

    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const progressBar = document.querySelector('#progressBar div');

    let currentChunk = 0;

    function uploadChunk() {
        if (currentChunk >= chunks) {
            alert('文件上传完成');
            return;
        }

        const chunk = file.slice(currentChunk * CHUNK_SIZE, (currentChunk + 1) * CHUNK_SIZE);
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('fileName', file.name);
        formData.append('currentChunk', currentChunk);
        formData.append('totalChunks', chunks);

        axios.post('http://localhost:3000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                const totalPercentCompleted = Math.round(((currentChunk * 100) + percentCompleted) / chunks);
                progressBar.style.width = totalPercentCompleted + '%';
            }
        })
        .then((response) => {
            console.log(`Chunk ${currentChunk + 1}/${chunks} uploaded successfully`);
            currentChunk++;
            uploadChunk(); // 上传下一个分片
        })
        .catch((error) => {
            console.error('上传出错:', error);
            alert('上传出错,请查看控制台获取详细信息');
        });
    }

    uploadChunk(); // 开始上传第一个分片
}