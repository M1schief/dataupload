// ./src/App.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import uploadFileToBlob, { isStorageConfigured, getBlobsInContainer } from './azure-storage-blob';
import DisplayImagesFromContainer from './ContainerImages';
const storageConfigured = isStorageConfigured();

const App = () => {
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState();
  const [fileUploaded, setFileUploaded] = useState('');

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  // *** GET FILES IN CONTAINER ***
  useEffect(() => {
    getBlobsInContainer().then((list) =>{
      // prepare UI for results
      setBlobList(list);
    })
  }, [fileUploaded]);

// Function to add a new message to the queue
  const addMessageToQueue = async (message) => {
      try {
          // Make an HTTP POST request to the Azure Functions endpoint
          const response = await axios.post('https://zhaohc.azurewebsites.net/api/HttpTrigger1?code=pSDhbJSqgIFBeZ8cyoNJBptFCHoIPhUn-SXk-fDvMXVaAzFuf-KnNw==', { message });

          // Handle success
          console.log('Message added to queue:', response.data);
      } catch (error) {
          // Handle error
          console.error('Failed to add message to queue:', error);
      }
  };

  const onFileChange = (event) => {
    // capture file into state
    setFileSelected(event.target.files[0]);
  };

  const onFileUpload = async () => {

    if(fileSelected && fileSelected?.name){
    // prepare UI
    setUploading(true);

    // *** UPLOAD TO AZURE STORAGE ***
    await uploadFileToBlob(fileSelected);

    await addMessageToQueue("hello");
    // reset state/form
    setFileSelected(null);
    setFileUploaded(fileSelected.name);
    setUploading(false);
    setInputKey(Math.random().toString(36));

    }

  };

  // display form
  const DisplayForm = () => (
    <div>
      <input type="file" onChange={onFileChange} key={inputKey || ''} />
      <button type="submit" onClick={onFileUpload}>
        Upload!
          </button>
    </div>
  )

  return (
    <div>
      <h1>Upload file to Azure Blob Storage</h1>
      {storageConfigured && !uploading && DisplayForm()}
      {storageConfigured && uploading && <div>Uploading</div>}
      <hr />
      {storageConfigured && blobList.length > 0 && <DisplayImagesFromContainer blobList={blobList}/>}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;


