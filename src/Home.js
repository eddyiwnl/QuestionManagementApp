import { Link } from 'react-router-dom';
// import './Home.css'

const Home = () => {

  var currFile;
  var editJson;

  function handleChange(e) {
    currFile = e.target.files[0].name;
    console.log("input json file name: ", e.target.files[0].name);
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(e.target.files[0]);
  }

  function onReaderLoad(event){
    editJson = JSON.parse(event.target.result);
    console.log("json: ", editJson)
  }
  
  return (
    <section className='section'>
        <h2>Question Management App</h2>
        <div>
          <label htmlFor="fileUpload">Upload JSON: </label>
          <br />
          <input
            type="file" 
            id="fileUpload" 
            onChange={handleChange} />
        </div>
    </section>
  );
};
export default Home;