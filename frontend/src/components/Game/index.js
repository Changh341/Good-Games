import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import { csrfFetch } from "../../store/csrf";
import './game.css'
import { Modal } from "../../context/Modal";
import ReviewEditSubmit from '../ReviewEditSubmit'


const Game = ({ game, setRefresh }) => {
  const userShelves = useSelector((state) => state.shelf)
  const userGames = useSelector((state) => state.game)
  let shelfIds = Object.keys(userShelves)
  const [isLoaded, setIsLoaded] = useState(false);
  const [image, setImage] = useState([]);
  const [showModal, setShowModal] = useState(false)




  const [shelfChange, setShelfChange] = useState(false)

  useEffect(() => {
    if (!shelfChange) return;

    const closeMenu = () => {
      setShelfChange(false);
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [shelfChange]);

  useEffect(() => {
    fetch(`/api/games/${game.name}/images`)
      .then((res) => res.json())
      .then((result) => {
        setImage(result);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    renderEditWrite()
  }, [userGames])


  const changingShelf = async (id) => {
    const payload = {
      status: game.status,
      shelfId: id,
      hoursProgressed: game.hoursProgressed
    }
    const response = await csrfFetch(`/api/shelves/${game.shelfId}/games/${game.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    if (response.ok) {
      setRefresh(true)
    }
  }


  const handleRemove = async () => {
    const response = await csrfFetch(`/api/shelves/${game.shelfId}/games/${game.id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      setRefresh(true)
    }
  }
  const currentShelf = (id) => {
    if (id == game.shelfId) {
      return true
    } else {
      return false
    }
  }
  const imageSetter = () => {
    if (isLoaded) {
      return (
        <img className='tiny-cover-image' src={`${image}`} ></img>
      )
    } else {
      <span>LOADING IMAGE</span>
    }
  }

  const renderEditWrite = () => {
    const currentGame = userGames[game.name]
    if (currentGame?.Review) {
      return (
        <>
          {currentGame.Review.rating}
          <button onClick={(event) => { setShowModal(true) }} className='smaller-button'>[Edit]</button>
        </>
      )
    } else {
      return (
        <button onClick={(event) => { setShowModal(true) }} className='standard-btn'>Review</button>
      )
    }
  }

  return (
    <>
      <tr>
        <td>{imageSetter()}</td>
        <td>{game.name}</td>
        <td>{game.status}</td>
        <td>{game.hoursProgressed}</td>
        <td>{renderEditWrite()}</td>
        <td className='tools-box'>
          <button className='smaller-button' onClick={(event) => { setShelfChange(true) }}>[reshelf]{shelfChange && (
            <div onChange={(event) => { changingShelf(event.target.value) }} className="profile-dropdown">
              {shelfIds.map((shelfId) => {
                return (
                  <div>
                    <input type="radio" value={shelfId} name={`game${game.id}`} checked={currentShelf(shelfId)} /><span className='radio-label'>{userShelves[shelfId].shelfName}</span>
                  </div>
                )
              })}
            </div>
          )
          }</button>
          <button className='x-button' onClick={(event) => { handleRemove() }}>x</button>
        </td>
      </tr>
      {showModal && <Modal type='reviewModal' onClose={() => setShowModal(false)}>
        <ReviewEditSubmit game={game} setShowModal={setShowModal} />
      </Modal>}
    </>
  )
}

export default Game