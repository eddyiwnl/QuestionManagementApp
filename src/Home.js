import { Link } from 'react-router-dom';
import './Home.css'
import { useState, useEffect } from 'react'
import { saveAs } from 'file-saver';

// TODO: make the form look nicer
// add a remove button to the MCQ and other types?
// change save location

const Home = () => {

  var currFile;

  const inputMCQ = [
    {
      type: "text",
      id: 1,
      value: ""
    }
  ];

  // The correct answer choices for multiple answer questions
  const inputCorrect = [
    {
      type: "text",
      id: 1,
      value: ""
    }
  ];

  const [MCQ, setMCQ] = useState(inputMCQ);
  const [multipleAnswers, setMultipleAnswers] = useState(inputCorrect);
  const [matchingPrompts, setMatchingPrompts] = useState(['']); // prompts list for matching questions
  const [matchingMatches, setMatchingMatches] = useState(['']); // matches list for matching questions
  const [editJson, setEditJson] = useState(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('');
  const [quizTitles, setQuizTitles] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [MCQVisible, setMCQVisible] = useState(false); // state to control multiple choice question 
  const [numericalVisible, setNumericalVisible] = useState(false); // state to control numerical question extra inputs
  const [minValue, setMinValue] = useState(''); // state to control numerical question min input
  const [maxValue, setMaxValue] = useState(''); // state to control numerical question max input
  const [multipleAnswersVisible, setMultipleAnswersVisible] = useState(false); // state to control multiple answers questions extra inputs
  const [matchingVisible, setMatchingVisible] = useState(false); // state to control matching questions extra inputs
  const [newQuestionData, setNewQuestionData] = useState({
    quiz_title: '',
    SCBT: '',
    quarter: '',
    number: '',
    points: '',
    stem: '',
    type: '',
    answer_ranges: [],
    choices: [],
    correct_answers: [],
    correct_matches : []
  });

  // ******************
  // This function handles when the "Add Choice" button is clicked
  // ******************  
  const addMCQInput = () => {
    setMCQ(s => {
      const lastId = s[s.length - 1].id;
      return [
        ...s,
        {
          type: "text",
          value: ""
        }
      ];
    });

    // console.log(MCQ);
    setNewQuestionData(prevData => ({
      ...prevData,
      choices: MCQ.map(choice => choice.value) // Assuming MCQ contains objects with a 'value' property
    }));

    // console.log(newQuestionData);
  };

  // ******************
  // This function handles when the "Add Answer" button is clicked
  // ******************  
  const addMultipleAnswerInput = () => {
    setMultipleAnswers(s => {
      const lastId = s[s.length - 1].id;
      return [
        ...s,
        {
          type: "text",
          value: ""
        }
      ];
    });

    setNewQuestionData(prevData => ({
      ...prevData,
      correct_answers: multipleAnswers.map(correct_answers => correct_answers.value) // Assuming MCQ contains objects with a 'value' property
    }));

    // console.log(newQuestionData);
  };

  // ******************
  // This function handles when text is inputted into the MCQ fields
  // ******************  
  const handleMCQChange = e => {
    e.preventDefault();

    const index = e.target.id;
    setMCQ(s => {
      const newArr = s.slice();
      newArr[index].value = e.target.value;

      return newArr;
    });
  };

  // ******************
  // This function handles when numerical question ranges are submitted
  // ******************  
  const handleUpdateAnswerRanges = () => {
    const answerRanges = [{ min: minValue, max: maxValue }];
    console.log(answerRanges)
    setNewQuestionData(prevData => ({ ...prevData, answer_ranges: answerRanges }));
    // setShowNumericalInputs(false); // Hide the numerical inputs after updating
    // console.log(newQuestionData);
  };

  // ******************
  // This function handles when text is inputted into the choices and correct answers fields
  // ******************  
  const handleMultipleAnswersChange = e => {
    e.preventDefault();

    const index = e.target.id;
    setMultipleAnswers(s => {
      const newArr = s.slice();
      newArr[index].value = e.target.value;

      return newArr;
    });
  };

  function removeHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
  }

  // ******************
  // This function handles when text is inputted into the prompts and matches fields
  // ******************  
  const addMatchingInput = () => {
    setNewQuestionData(prevData => ({
      ...prevData,
      correct_matches: [
        ...prevData.correct_matches,
        { match: '', prompt: '' } // Initialize a new prompt-match pair
      ]
    }));

    console.log(newQuestionData);
  };

  const handleMatchingData = (e, index, type) => {
    const { value } = e.target;
  
    setNewQuestionData(prevData => ({
      ...prevData,
      correct_matches: prevData.correct_matches.map((pair, i) => {
        if (i === index) {
          return {
            ...pair,
            [type]: value
          };
        }
        return pair;
      })
    }));
  };

  // ******************
  // This function handles when a json file is inputted
  // ******************
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

  // ******************
  // This function renders the Answer Ranges column in the table
  // ******************
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

  // ******************
  // This function handles when the user enters in new question data
  // ******************
  function handleNewData(event) {
    const { name, value } = event.target;
    setNewQuestionData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    // Check if the selected type is "multiple_choice_question" and set MCQVisible accordingly
    if (name === 'type') {
      if (value === 'multiple_choice_question') {
        setMCQVisible(true);
        console.log("Setting MCQ visible")
      } else {
        setMCQVisible(false);
        console.log("Setting MCQ invisible")
      }

      if (value === 'numerical_question') {
        setNumericalVisible(true);
        console.log("Setting Numerical visible")
      } else {
        setNumericalVisible(false);
        console.log("Setting Numerical invisible")
      }

      if (value === 'multiple_answers_question') {
        setMultipleAnswersVisible(true);
        console.log("Setting multiple answers question visible")
      } else {
        setMultipleAnswersVisible(false);
        console.log("Setting multiple answers question invisible")
      }

      if(value === 'matching_question') {
        setMatchingVisible(true);
        console.log("Setting matching question visible");
      } else {
        setMatchingVisible(false);
        console.log("Setting matching question invisible");
      }
    }
  }

  // ******************
  // This function handles new MCQ choices in the form
  // ******************
  function addChoice() {
    setNewQuestionData(prevState => ({
      ...prevState,
      choices: [...prevState.choices, ''], // Add an empty choice
    }));
  }

  // ******************
  // This function handles when the New Question button is pressed
  // ******************
  function handleNewQuestion() {
    console.log('Creating a new question...');
    setShowForm(true);
  }

  // ******************
  // This function handles when the Submit Question button is pressed
  // ******************
  function handleSubmitQuestion() { 
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
    else if(newQuestionData.type=="multiple_choice_question") {
      const { SCBT, choices, number, points, quarter, quiz_title, stem, type } = newQuestionData;
      const jsonEntry = JSON.stringify({ SCBT, choices, number, points, quarter, quiz_title, stem, type });
      console.log('JSON entry:', jsonEntry);
      setEditJson(prevEditJson => (prevEditJson ? [...prevEditJson, {
        SCBT: newQuestionData.SCBT,
        choices: newQuestionData.choices,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }] : [{
        SCBT: newQuestionData.SCBT,
        choices: newQuestionData.choices,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }]));
      setMCQVisible(false);
    }
    else if(newQuestionData.type=="numerical_question") {
      const { SCBT, answer_ranges, number, points, quarter, quiz_title, stem, type } = newQuestionData;
      const jsonEntry = JSON.stringify({ SCBT, answer_ranges, number, points, quarter, quiz_title, stem, type });
      console.log('JSON entry:', jsonEntry);
      setEditJson(prevEditJson => (prevEditJson ? [...prevEditJson, {
        SCBT: newQuestionData.SCBT,
        answer_ranges: newQuestionData.answer_ranges,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }] : [{
        SCBT: newQuestionData.SCBT,
        answer_ranges: newQuestionData.answer_ranges,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }]));
      setNumericalVisible(false);
    }
    else if(newQuestionData.type=="multiple_answers_question") {
      const { SCBT, choices, correct_answers, number, points, quarter, quiz_title, stem, type } = newQuestionData;
      const jsonEntry = JSON.stringify({ SCBT, correct_answers, number, points, quarter, quiz_title, stem, type });
      console.log('JSON entry:', jsonEntry);
      setEditJson(prevEditJson => (prevEditJson ? [...prevEditJson, {
        SCBT: newQuestionData.SCBT,
        choices: newQuestionData.choices,
        correct_answers: newQuestionData.correct_answers,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }] : [{
        SCBT: newQuestionData.SCBT,
        choices: newQuestionData.choices,
        correct_answers: newQuestionData.correct_answers,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }]));
      setMultipleAnswersVisible(false);
    }
    else if(newQuestionData.type=="matching_question") {
      const { SCBT, correct_matches, number, points, quarter, quiz_title, stem, type } = newQuestionData;
      const jsonEntry = JSON.stringify({ SCBT, correct_matches, number, points, quarter, quiz_title, stem, type });
      console.log('JSON entry:', jsonEntry);
      setEditJson(prevEditJson => (prevEditJson ? [...prevEditJson, {
        SCBT: newQuestionData.SCBT,
        correct_matches: newQuestionData.correct_matches,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }] : [{
        SCBT: newQuestionData.SCBT,
        correct_matches: newQuestionData.correct_matches,
        number: newQuestionData.number,
        points: newQuestionData.points,
        quarter: newQuestionData.quarter,
        quiz_title: newQuestionData.quiz_title,
        stem: newQuestionData.stem,
        type: newQuestionData.type
      }]));
      setMatchingVisible(false);
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
      choices: [],
      correct_answers: [],
      correct_matches: [],
    });

    setMCQ(inputMCQ);
    setMultipleAnswers(inputCorrect);
    setShowForm(false);
  }

  // ******************
  // This handles when the "Save as JSON" button is clicked
  // ******************
  const saveAsJsonFile = () => {
    const json = JSON.stringify(editJson, null, 2); // Convert editJson to formatted JSON string
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'editJsonData.json');
  };


  // ******************
  // This handles when editJson is changed
  // ******************
  useEffect(() => {
    if (editJson) {
      const titles = [...new Set(editJson.map(item => item.quiz_title))];
      setQuizTitles(titles.sort());
      console.log(editJson);
    }
  }, [editJson]);

  // ******************
  // This function handles when numerical question ranges are updated
  // ******************  
  useEffect(() => {
    console.log('New answer ranges:', newQuestionData.answer_ranges);
    setNewQuestionData(prevData => ({
      ...prevData,
      answer_ranges: newQuestionData.answer_ranges,
    }));

    console.log(newQuestionData);
  }, [newQuestionData.answer_ranges]);

  // ******************
  // This function handles when MCQ question ranges are updated
  // ******************  
  useEffect(() => {
    setNewQuestionData(prevData => ({
      ...prevData,
      choices: newQuestionData.choices,
    }));

    console.log(newQuestionData);
  }, [newQuestionData.choices]);

  // ******************
  // This function handles when multiple answer question ranges are updated
  // ******************  
  useEffect(() => {
    setNewQuestionData(prevData => ({
      ...prevData,
      correct_answers: newQuestionData.correct_answers,
    }));

    console.log(newQuestionData);
  }, [newQuestionData.correct_answers]);



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
        {/* code for filtering by quiz title */}
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
        {/* code for the add question form  */}
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
              {MCQVisible && (
                <div>
                  <label htmlFor="choices">Choices:</label>
                  {MCQ.map((item, i) => {
                    return (
                      <input
                        onChange={handleMCQChange}
                        value={item.value}
                        id={i}
                        type={item.type}
                        size="40"
                      />
                    );
                  })}
                  {/* {newQuestionData.choices.map((choice, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        id={`choice${index}`}
                        name={`choices[${index}]`}
                        value={choice}
                        onChange={handleNewData}
                      />
                    </div>
                  ))} */}
                  <button type="button" onClick={addMCQInput}>Add Choice</button>
                </div>
              )}
              {numericalVisible && (
                <div>
                  <label htmlFor="minValueInput">Min Value:</label>
                  <input
                    type="number"
                    id="minValueInput"
                    name="minValue"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                  /><br />
                  <label htmlFor="maxValueInput">Max Value:</label>
                  <input
                    type="number"
                    id="maxValueInput"
                    name="maxValue"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                  /><br />
                  <button type="button" onClick={handleUpdateAnswerRanges}>Update Answer Ranges</button>
                </div>
              )}
              {multipleAnswersVisible && (
                <div>
                  <label htmlFor="choices">Choices:</label>
                  {MCQ.map((item, i) => {
                    return (
                      <input
                        onChange={handleMCQChange}
                        value={item.value}
                        id={i}
                        type={item.type}
                        size="40"
                      />
                    );
                  })}
                  <button type="button" onClick={addMCQInput}>Add Choice</button>
                  <br />
                  <label htmlFor="answers">Correct Answers:</label>
                  {multipleAnswers.map((item, i) => {
                    return (
                      <input
                        onChange={handleMultipleAnswersChange}
                        value={item.value}
                        id={i}
                        type={item.type}
                        size="40"
                      />
                    );
                  })}
                  <button type="button" onClick={addMultipleAnswerInput}>Add Choice</button>
                </div>
              )}
              {matchingVisible && (
                <div>
                  {newQuestionData.correct_matches.map((pair, index) => (
                    <div key={index}>
                      <label htmlFor={`promptInput${index}`}>Prompt:</label>
                      <input
                        type="text"
                        id={`promptInput${index}`}
                        value={pair.prompt}
                        onChange={(e) => handleMatchingData(e, index, 'prompt')}
                      />
                      <label htmlFor={`matchInput${index}`}>Match:</label>
                      <input
                        type="text"
                        id={`matchInput${index}`}
                        value={pair.match}
                        onChange={(e) => handleMatchingData(e, index, 'match')}
                      />
                    </div>
                  ))}
                  <button type="button" onClick={addMatchingInput}>Add prompt / match</button>
                </div>
              )}
              <br />

              <button type="button" onClick={handleSubmitQuestion}>Submit Question</button>
            </form>
        </div>
        )}
        </div>
        {editJson && (
        <div className="table-container">
          <button onClick={saveAsJsonFile}>Save as JSON</button>
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