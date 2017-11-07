import { PLAYER, DEALER, INITIAL_CARDS_DEALT, GAME_PARTICIPANTS, ROUNDS_UNTIL_SHUFFLE, DEAL, SHUFFLE_AND_DEAL } from './constants'

import Deck from './Deck'

import Hand from './Hand'

import UIHand from './ui/Hands'

import UIStats from './ui/Stats'

import UIButtons from './ui/Buttons'


export default class Game {


  constructor() {

    UIButtons.initListeners(this)

    this.hands = clearHands()

    this.playerVictoryPercentage = null

    this.victoryCount = {

      player: 0,

      dealer: 0,

    }

    this.shuffleDeck()

    this.deal()

  }


  deal() {

    UIButtons.setDealText(DEAL)

    this.roundsSinceShuffle++

    renderNewRound()

    this.hands = clearHands()

    for (var i = 0; i < 2; i++) {

      for (let participant of GAME_PARTICIPANTS) {
        //if Player is dealt blackjack, nextTurn() method deals final Dealer card, so don't call it again.
        !this.hands[PLAYER].blackjack && this.dealCard(participant)
        
      }

    }

  }

  
  dealCard(participant) {

    const card = this.deck.drawCard()

    this.hands[participant].setCard(card)

    UIHand.update(participant, card, this.hands[participant].cards.length - 1)

    participant === DEALER && this.hands[participant].setStand()

    isGameOver(this.hands) ? this.declareVictor() : this.nextTurn(participant)

  }


  nextTurn(participant) {

    if (shouldDealerPlay(this.hands)) {

      participant === PLAYER && renderDealerUI(this.hands[DEALER].cards[0])

      this.dealCard(DEALER)

    }

  }


  setStandPlayer() {

    this.hands[PLAYER].setStand()

    isGameOver(this.hands) ? this.declareVictor() : this.nextTurn(DEALER)

  }


  declareVictor() {

    const victor = determineVictor(this.hands)
    
    renderDealerUI(this.hands[DEALER].cards[0])

    if (shouldShuffle(this.roundsSinceShuffle)) {

      UIButtons.setDealText(SHUFFLE_AND_DEAL)

      this.shuffleDeck()

    }

    this.victoryCount[victor] += 1

    UIStats.update(victor, this.victoryCount)

    console.log('victor: ', victor)

  }


  shuffleDeck() {
    
    this.roundsSinceShuffle = 1

    this.deck = new Deck()

  }


}

//logic
const isPlayerFinished = hands => hands[PLAYER].blackjack || hands[PLAYER].stand


const shouldDealerPlay = hands => !hands[DEALER].blackjack && !hands[DEALER].stand && isPlayerFinished(hands)


const isFirstDealerCard = (participant, cards) => participant === DEALER && cards.length === 1


const isGameOver = hands => hands[DEALER].bust || hands[PLAYER].bust || (hands[PLAYER].stand || hands[PLAYER].blackjack) && (hands[DEALER].stand || hands[DEALER].blackjack)


const shouldShuffle = roundsSinceShuffle => roundsSinceShuffle === ROUNDS_UNTIL_SHUFFLE

//returns string
const determineVictor = hands => hands[DEALER].bust || (!hands[PLAYER].bust && hands[PLAYER].cumulativeVal > hands[DEALER].cumulativeVal) ? PLAYER : DEALER

//UI utils
const renderDealerUI = firstDealerCard => {

  UIButtons.toggleState()

  UIHand.revealDealer(firstDealerCard)

}


const renderNewRound = () => {

  UIButtons.toggleState()

  UIHand.clear()

}


const clearHands = () => {

  return {

    player: new Hand(PLAYER),

    dealer: new Hand(DEALER),

  }

}
