/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import './css/DAFSA.css';
import * as d3 from 'd3';

const CIRCLE_RADIUS = 30;
const VERTICAL_SPACING = 70;
const CANVAS_WIDTH = 1000;

export default class DAFSA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Root node, string is false because and empty string will change to null
      root: [false, 0, false],
      // Incrementing unique id
      id: 1,
      // Array representing dict which will implement trie
      dict: [],
      // Arrary representing the rendered nodes
      renderedNodes: [],
      // The current word inside of the text input
      inputWord: '',
    };
    // Inserting the root node into the dict
    this.state.dict[this.state.root] = [];
  }

  addWord(word) {
    let prevNode;
    let currNode = this.state.root;

    const letterIter = word.split('').entries();
    let letterResult = letterIter.next();

    while (!letterResult.done) {
      const [i, letter] = letterResult.value;
      let foundLetter = false;
      const childIter = this.state.dict[currNode].entries();
      let childResult = childIter.next();

      while (!childResult.done) {
        const [j, node] = childResult.value;
        if (node[0] === letter) {
          if (i === word.length - 1 && !node[2]) {
            /* eslint-disable-next-line no-loop-func */
            this.setState((state) => {
              state.dict[currNode][j] = [currNode[0], currNode[1], true];
              return { dict: state.dict };
            });
            // this.state.dict[currNode][j] = [currNode[0], currNode[1], true];
            prevNode = currNode;
            currNode = this.state.dict[currNode][j];


            /* eslint-disable-next-line no-loop-func */
            this.setState((state) => {
              state.dict[currNode] = this.state.dict[node];
              return { dict: state.dict };
            });
            // this.state.dict[currNode] = this.state.dict[node];
            this.setState((state) => {
              delete state.dict[node];
              return { dict: state.dict };
            });
            // delete this.state.dict[node];
          } else {
            prevNode = currNode;
            currNode = node;
          }
          foundLetter = true;
          break;
        }
        childResult = childIter.next();
      }
      if (!foundLetter) {
        let newNode;
        if (i === word.length - 1) {
          newNode = [letter, this.state.id, true];
        } else {
          newNode = [letter, this.state.id, false];
        }

        const updateId = (state) => {
          state.id += 1;

          return { id: state.id };
        };
        this.setState(updateId(this.state));


        /* eslint-disable-next-line no-loop-func */
        const updateDict = (state) => {
          state.dict[currNode].push(newNode);
          state.dict[newNode] = [];
          return { dict: state.dict };
        };
        this.setState(updateDict(this.state));

        const parent = currNode;
        setTimeout(() => this.renderNewNode(parent, newNode, i + 1), 500 * (i + 1));

        // eslint-disable-next-line no-unused-vars
        prevNode = currNode;
        currNode = newNode;
      }
      letterResult = letterIter.next();
    }
  }

  findWordsFromNode(words, prefix = '', node = this.state.root) {
    if (node[2]) {
      words.push(prefix);
    }

    this.state.dict[node].forEach((child) => {
      const newPrefix = prefix + child[0];
      this.findWordsFromNode(words, newPrefix, child);
    });
  }

  renderNewNode(parent, node, level) {

    let newNumOnLevel = 1; // Number of nodes on the level
    let counter = 1; // Counter for the number of nodes on the level
    let availableSpace = (CANVAS_WIDTH) / (newNumOnLevel + 1); // Space available for each node
    if (this.state.renderedNodes[level]) { // If there are nodes on the level
      newNumOnLevel += Object.keys(this.state.renderedNodes[level]).length; // Add the number of nodes on the level
      availableSpace = (CANVAS_WIDTH) / (newNumOnLevel + 1); // Recalculate the space available for each node
      const updateRenderedNodes = (state) => { // Update the rendered nodes
        Object.keys(state.renderedNodes[level]).forEach((key) => { // For each node on the level
          const item = state.renderedNodes[level][key]; // Get the node

          // -----------------Testing-----------------
          // console.log('rerendering:', item[2].text());
          // console.log('counter:', counter);
          // -----------------Testing-----------------


          const renderedParent = this.state.renderedNodes[level - 1][item[5]][1];  // parent circle

          const circleX = availableSpace * counter; // it is the same as the x of the parent
          const circleY = VERTICAL_SPACING * (level + 1); // it is the same as the y of the parent

          // Then when rerendering change the x1 of the child node's line
          item[1].transition().duration(500) // circle
            .attr('cx', circleX) // x position
            .attr('cy', circleY); // y  position
          item[2].transition().duration(500) // text
            .attr('x', availableSpace * counter - 10) // x position
            .attr('y', VERTICAL_SPACING * (level + 1)); // y position

          item[3].transition().duration(500) // line
            .attr('x1', renderedParent.attr('cx')) // x1 position
            .attr('y1', renderedParent.attr('cy')) // y1 position
            .attr('x2', circleX) // x2 position
            .attr('y2', circleY); // y2 position

          item[4].forEach((line) => { // line to children
            line.transition().duration(500) // line
              .attr('x1', circleX) // x1 position
              .attr('y1', circleY); // y1 position
          });

          counter += 1; // Increment the counter
        });
        return { renderedNodes: state.renderedNodes }; // Return the updated rendered nodes
      };
      this.setState(updateRenderedNodes(this.state)); // Update the rendered nodes
    }

    let color = '#f3f3f3ff';
    if (node[2]) { // If the node is a word
      color = '#f005';
    }

    // -----------------Testing-----------------
    // console.log('creating:', node[0]);
    // -----------------Testing-----------------

    const renderedParent = this.state.renderedNodes[level - 1][parent][1]; // parent circle

    const circleX = availableSpace * counter; // it is the same as the x of the parent
    const circleY = VERTICAL_SPACING * (level + 1); // it is the same as the y of the parent

    const line = d3.select(this.svg).append('line') // line
      .attr('x1', renderedParent.attr('cx')).attr('y1', renderedParent.attr('cy')) // x1 and y1 position
      .attr('x2', renderedParent.attr('cx')) // x2 position
      .attr('y2', renderedParent.attr('cy')) // y2 position
      .attr('stroke', 'black') // color
      .lower(); // lower the line

    line.transition().duration(500) // line
      .attr('x2', circleX).attr('y2', circleY); // x2 and y2 position


    const circle = d3.select(this.svg).append('circle') // circle
      .attr('cx', circleX) // x position
      .attr('cy', circleY) // y position
      .attr('r', CIRCLE_RADIUS) // radius
      .style('fill', color); // color

    const text = d3.select(this.svg).append('text') // text
      .attr('x', availableSpace * counter - 10) // x position
      .attr('y', 5 + VERTICAL_SPACING * (level + 1)) // y position
      .text(`'${node[0]}'`) // text
      .style('font-size', '25px') // font size
      .style('fill', 'black'); // color

    const childLines = []; // Array of lines to children

    this.state.renderedNodes[level - 1][parent][4].push(line); // Add the line to the parent's array of lines to children


    const addToRenderedNodes = ((state) => { // Add the node to the rendered nodes
      if (state.renderedNodes[level]) { // If there are nodes on the level
        state.renderedNodes[level][node] = [node, circle, text, line, childLines, parent]; // Add the node
      } else { // If there are no nodes on the level
        state.renderedNodes[level] = []; // Create an array for the nodes on the level
        state.renderedNodes[level][node] = [node, circle, text, line, childLines, parent]; // Add the node
      } // Return the updated rendered nodes
      return { renderedNodes: state.renderedNodes };
    });

    this.setState(addToRenderedNodes(this.state)); // Update the rendered nodes
  }

  // function to render the tree from the root
  componentDidMount() {
    const circle = d3.select(this.svg).append('circle') // attach a circle
      .attr('cx', CANVAS_WIDTH / 2) // position the x-centre
      .attr('cy', 50) // position the y-centre
      .attr('r', CIRCLE_RADIUS) // set the radius
      .style('fill', '#f3f3f3ff')
      .style('position', 'relative'); // set the fill colour
    const text = d3.select(this.svg).append('text') // attach a text
      .attr('x', CANVAS_WIDTH / 2 - 15) // position the x-centre
      .attr('y', 55) // position the y-centre 
      .text("root") // set the text
      .style('font-size', '16px') // set the font size
      .style('fill', 'black'); // set the fill colour
    const childLines = []; // create an array to store the child lines
    const pushRootToRenderedNodes = (state) => {
      state.renderedNodes[0] = []; // create an array to store the nodes on the first level
      state.renderedNodes[0][[false, 0, false]] = [[false, 0, false], circle, text, null, childLines, null]; // add the root node to the renderedNodes array


      return { renderedNodes: state.renderedNodes }; // return the updated state
    };
    this.setState(pushRootToRenderedNodes(this.state)); // update the state
  }

  // auto complete function for the input box
  // to help the user find the node they want to add
  autocomplete(prefix) { // prefix is the string that the user has typed in
    const words = []; // array to store the words that match the prefix
    let currNode = this.state.root; // start at the root

    // -----------------Testing-----------------
    // console.log('currNode', currNode);
    // -----------------Testing-----------------

    prefix.split('').forEach((letter) => { // for each letter in the prefix
      let foundLetter = false; // boolean to check if the letter was found

      this.state.dict[currNode].forEach((node) => { // for each node in the current node's children
        if (node[0] === letter && !foundLetter) { // if the letter matches the node's letter and the letter hasn't been found
          currNode = node; // set the current node to the node
          foundLetter = true; // set the found letter to true
        }
      });
      if (!foundLetter) { // if the letter wasn't found
        console.error('PREFIX NOT IN TRIE');
        return words; // return the words
      }
    });
    const baseNode = currNode; // set the base node to the current node
    this.findWordsFromNode(words, prefix, baseNode); // find the words from the base node
    return words; // return the words
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.state.inputWord.length > 0) {
      this.addWord(this.state.inputWord);
      this.setState({ inputWord: '' });
    }
  }

  // minimize function
  minimize(e) {
    e.preventDefault()

  }


  render() {
    const { inputWord } = this.state;

    return (
      <div className='sketchContainer'>
        <form className='formStyle' onSubmit={e => this.handleSubmit(e)}>
          <div className="formItemStyle">
            <input
              className='inputStyle'
              value={inputWord}
              onChange={e => this.setState({ inputWord: e.target.value })}
              type="text"
              placeholder="add a word"
            />
            <button className='buttonStyle' type="submit">Add Word</button>
          </div>
        </form>
        <svg width={CANVAS_WIDTH} height="800" id="trie" ref={(c) => { this.svg = c; }} className="canvasStyle" />
        <button className='buttonStyle' onClick={() => this.minimize()}>Minimize</button>
      </div>
    );
  }
}