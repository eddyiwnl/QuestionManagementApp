import { Link } from 'react-router-dom';
import './Home.css'
import { useState, useEffect } from 'react'

const Home = () => {

  var currFile;

  const [editJson, setEditJson] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
  const [quizTitles, setQuizTitles] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [newQuestionData, setNewQuestionData] = useState({
    quiz_title: '',
    SCBT: '',
    quarter: '',
    number: '',
    points: '',
    stem: '',
    type: '',
    answer_ranges: [],
    choices: []
  });


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

  function handleNewData(event) {
    const { name, value } = event.target;
    setNewQuestionData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }

  function handleNewQuestion() {
    console.log('Creating a new question...');
    setShowForm(true);
  }

  function handleSubmitQuestion() { //TODO: MCQ, numerical, matching, multiple answers, ...
    console.log('Submitting question...');
    console.log('Form Values:', newQuestionData);

    if(newQuestionData.type=="essay_question") {
      const { SCBT, number, points, quarter, quiz_title, stem, type } = newQuestionData;
      const jsonEntry = JSON.stringify({ SCBT, number, points, quarter, quiz_title, stem, type });
      console.log('JSON entry:', jsonEntry);
      setEditJson(prevEditJson => (prevEditJson ? [...prevEditJson, {
        SCBT: newQuestionData.SCBT,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }] : [{
        SCBT: newQuestionData.SCBT,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }]));
    }

    setNewQuestionData({ // resetting form
      quiz_title: '',
      SCBT: '',
      quarter: '',
      number: '',
      points: '',
      stem: '',
      type: '',
      answer_ranges: [],
      choices: []
    });
    setShowForm(false);
  }

  useEffect(() => {
    if (editJson) {
      const titles = [...new Set(editJson.map(item => item.quiz_title))];
      setQuizTitles(titles.sort());
      console.log(editJson);
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
        <br />
        <button onClick={handleNewQuestion}>New Question</button>
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
        {showForm && (
        <div className="form-container">
          <h3>Add New Question</h3>
            <form>
              <label htmlFor="scbtInput">SCBT:</label>
              <input type="text" id="scbtInput" name="SCBT" value={newQuestionData.SCBT} onChange={handleNewData} /><br />

              <label htmlFor="quizTitleInput">Quiz Title:</label>
              <input type="text" id="quizTitleInput" name="quiz_title" value={newQuestionData.quiz_title} onChange={handleNewData} /><br />

              <label htmlFor="quarterSelect">Quarter:</label>
              <select id="quarterSelect" name="quarter" value={newQuestionData.quarter} onChange={handleNewData}>
                <option value="">Select Quarter</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select><br />

              <label htmlFor="numberInput">Number:</label>
              <input type="number" id="numberInput" name="number" value={newQuestionData.number} onChange={handleNewData} /><br />

              <label htmlFor="pointsInput">Points:</label>
              <input type="number" id="pointsInput" name="points" value={newQuestionData.points} onChange={handleNewData} /><br />

              <label htmlFor="stemTextarea">Stem:</label>
              <textarea id="stemTextarea" name="stem" value={newQuestionData.stem} onChange={handleNewData} /><br />

              <label htmlFor="typeSelect">Type:</label>
              <select id="typeSelect" name="type" value={newQuestionData.type} onChange={handleNewData}>
                <option value="">Select Type</option>
                <option value="multiple_choice_question">Multiple Choice</option>
                <option value="numerical_question">Numerical</option>
                <option value="multiple_answers_question">Multiple Answers</option>
                <option value="matching_question">Matching</option>
                <option value="essay_question">Essay</option>
                {/* Add more options for other question types */}
              </select><br />

              <button type="button" onClick={handleSubmitQuestion}>Submit Question</button>
            </form>
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