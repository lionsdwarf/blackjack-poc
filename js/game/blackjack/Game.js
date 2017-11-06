import { PLAYER, DEALER, INITIAL_CARDS_DEALT, GAME_PARTICIPANTS, ROUNDS_BEFORE_SHUFFLE } from './constants'

import Deck from './Deck'

import Hand from './Hand'

import UIHands from './ui/Hands'

import UIButtons from './ui/Buttons'


export default class Game {


  constructor() {

    UIButtons.initListeners(this)

    this.deck = new Deck()

    this.hands = clearHands()

    this.roundCount = 0

  }


  deal() {

    this.roundCount++
    
    this.roundCount === ROUNDS_BEFORE_SHUFFLE && this.shuffleDeck()

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
    //select card, remove it from deck
    const card = this.deck.drawCard()
    //add card to hand
    this.hands[participant].setCard(card)

    UIHands.update(participant, card)

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

    renderDealerUI(this.hands[DEALER].cards[0])
  
    console.log('victor: ', determineVictor(this.hands))

  }


  shuffleDeck() {

    this.deck = new Deck()

    this.roundCount = 0

  }


}

//logic
const isPlayerFinished = hands => hands[PLAYER].blackjack || hands[PLAYER].stand

const shouldDealerPlay = hands => !hands[DEALER].blackjack && !hands[DEALER].stand && isPlayerFinished(hands)

const isFirstDealerCard = (participant, cards) => participant === DEALER && cards.length === 1

const isGameOver = hands => hands[DEALER].bust || hands[PLAYER].bust || (hands[PLAYER].stand || hands[PLAYER].blackjack) && (hands[DEALER].stand || hands[DEALER].blackjack)
//returns string
const determineVictor = hands => hands[DEALER].bust || (!hands[PLAYER].bust && hands[PLAYER].cumulativeVal > hands[DEALER].cumulativeVal) ? PLAYER : DEALER

//UI util
const renderDealerUI = firstDealerCard => {

  UIButtons.toggleState()

  UIHands.revealDealer(firstDealerCard)

}


const renderNewRound = () => {

  UIButtons.toggleState()

  UIHands.clear()

}


const clearHands = () => {

  return {

    player: new Hand(PLAYER),

    dealer: new Hand(PLAYER),

  }

}
