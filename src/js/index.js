import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import './../css/style.css'

class App extends React.Component {
   constructor(props){
      super(props)
      this.state = {
         numberOfBets: 0,
         minimumBet: 0,
         totalBet: 0,
         maxAmountOfBets: 0
      }

      if (typeof window.ethereum !== 'undefined') {
         this.web3 = new Web3(window.ethereum)
         window.ethereum.enable().catch(console.error)
      } else if (typeof web3 !== 'undefined') {
         this.web3 = new Web3(web3.currentProvider)
      } else {
         this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
      }

      const MyContract = this.web3.eth.contract([
        {"constant":false,"inputs":[{"name":"numberSelected","type":"uint256"}],"name":"bet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
        {"constant":true,"inputs":[],"name":"numberOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"totalBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"minimumBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"maxAmountOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}
      ])

      this.state.ContractInstance = MyContract.at("0xd9145CCE52D386f254917e481eB44e9943F39138")
   }

   componentDidMount(){
      this.updateState()
      this.setupListeners()
   }

   updateState(){
      this.state.ContractInstance.minimumBet((err, result) => {
         if(result != null) this.setState({minimumBet: parseFloat(this.web3.fromWei(result, 'ether'))})
      })
      this.state.ContractInstance.totalBet((err, result) => {
         if(result != null) this.setState({totalBet: parseFloat(this.web3.fromWei(result, 'ether'))})
      })
      this.state.ContractInstance.numberOfBets((err, result) => {
         if(result != null) this.setState({numberOfBets: parseInt(result)})
      })
      this.state.ContractInstance.maxAmountOfBets((err, result) => {
         if(result != null) this.setState({maxAmountOfBets: parseInt(result)})
      })
   }

   setupListeners(){
      let liNodes = this.refs.numbers.querySelectorAll('li')
      liNodes.forEach(li => {
         li.addEventListener('click', () => {
            liNodes.forEach(item => item.classList.remove('active'))
            li.classList.add('active')
            this.voteNumber(parseInt(li.innerHTML))
         })
      })
   }

   voteNumber(number){
      let bet = this.refs['ether-bet'].value
      if(!bet) bet = 0.1

      if(parseFloat(bet) < this.state.minimumBet){
         alert('You must bet more than the minimum bet threshold')
      } else {
         this.state.ContractInstance.bet(number, {
            gas: 300000,
            from: this.web3.eth.accounts[0],
            value: this.web3.toWei(bet, 'ether')
         }, (err, result) => {
            if(!err) console.log("Transaction successfully broadcasted:", result)
         })
      }
   }

   render(){
      return (
         <div className="main-container">
            <h1>Bet for your best number and win huge amounts of Ether</h1>
            <div className="block">
               <b>Number of bets:</b> &nbsp;<span>{this.state.numberOfBets}</span><br/>
               <b>Total ether bet:</b> &nbsp;<span>{this.state.totalBet} ether</span><br/>
               <b>Minimum bet:</b> &nbsp;<span>{this.state.minimumBet} ether</span><br/>
               <b>Max amount of bets:</b> &nbsp;<span>{this.state.maxAmountOfBets}</span>
            </div>
            <hr/>
            <h2>Vote for the next number</h2>
            <label>
               <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet}/></b> ether
               <br/>
            </label>
            <ul ref="numbers">
               {[1,2,3,4,5,6,7,8,9,10].map(n => <li key={n}>{n}</li>)}
            </ul>
         </div>
      )
   }
}

ReactDOM.render(<App />, document.getElementById('root'))
