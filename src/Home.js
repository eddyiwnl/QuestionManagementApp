import { Link } from 'react-router-dom';
import './Home.css'
import { useState, useEffect } from 'react'

const Home = () => {

  var currFile;

  const [editJson, setEditJson] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
  const [quizTitles, setQuizTitles] = useState([]);


  function removeHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
  }

  function handleChange(e) {
    currFile = e.target.files[0].name;
    console.log("input json file name: ", e.target.files[0].name);
    var reader = new FileReader();
    reader.onload = () => {
      const jsonData = JSON.parse(reader.result);
      console.log("json: ", jsonData);
      console.log("json element: ", jsonData[0]);
      jsonData.forEach(item => {
        item.stem = removeHtmlTags(item.stem);
      });
      setEditJson(jsonData);
    };
    reader.readAsText(e.target.files[0]);
  }

  // function onReaderLoad(event){
  //   editJson = JSON.parse(event.target.result);
  //   console.log("json: ", editJson)
  //   console.log("json element: ", editJson[0])
  // }

  function renderAnswerRanges(item) {
    switch (item.type) {
      case 'multiple_choice_question':
        // return "HELLO";
        return JSON.stringify(item.choices);
      case 'numerical_question':
        return `Min: ${item.answer_ranges[0].min}, Max: ${item.answer_ranges[0].max}`;
      case 'multiple_answers_question':
        const choices = item.choices.join('.\n');
        const correctAnswers = item.correct_answers.join('.\n');
        return `Choices: [${choices}]\nCorrect Answers: [${correctAnswers}]`;
      case 'matching_question':
        return item.correct_matches.map(pair => `Prompt: ${pair.prompt}\nMatch: ${pair.match}\n`).join('');
      // Add more cases for other question types here
      default:
        return '';
    }
  }

  useEffect(() => {
    if (editJson) {
      const titles = [...new Set(editJson.map(item => item.quiz_title))];
      setQuizTitles(titles.sort());
    }
  }, [editJson]);

   // Filter table data based on selected quiz title
   const filteredData = selectedQuizTitle
     ? editJson.filter(item => item.quiz_title === selectedQuizTitle)
     : editJson;

  
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
        {editJson && (
        <div className="filter-container">
          <label htmlFor="quizTitleSelect">Select Quiz Title: </label>
          <select id="quizTitleSelect" value={selectedQuizTitle} onChange={(e) => setSelectedQuizTitle(e.target.value)}>
            <option value="">All</option>
            {quizTitles.map((title, index) => (
              <option key={index} value={title}>{title}</option>
            ))}
          </select>
        </div>
        )}
        </div>
        {editJson && (
        <div className="table-container">
          <h3>JSON Data</h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>SCBT</th>
                <th>Answer Ranges</th>
                <th>Number</th>
                <th>Points</th>
                <th>Quarter</th>
                <th>Quiz Title</th>
                <th>Stem</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.SCBT}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{renderAnswerRanges(item)}</td>
                  {/* <td>{renderAnswerRanges(item)}</td> */}
                  <td>{item.number}</td>
                  <td>{item.points}</td>
                  <td>{item.quarter}</td>
                  <td>{item.quiz_title}</td>
                  <td>{item.stem}</td>
                  <td>{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
export default Home;