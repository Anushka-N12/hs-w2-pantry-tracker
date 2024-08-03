'use client'
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { collection, addDoc, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from '../components/firebase';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quan: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [recipieModal, setRecipieModal] = useState(false);
  const [recipies, setRecipies] = useState([]);

  // Add items
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.quan !== '') {
      await addDoc(collection(db, 'items'), { name: newItem.name.trim(), quan: newItem.quan.trim() });
      setNewItem({ name: '', quan: '' });
    }
  };

  // Display items
  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);
    });
    return () => unsubscribe();
  }, []);

  // Delete items
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  // For upload pop-up
  const toggleModal = () => {
    setModal(!modal);
  };
  const toggleRecipieModal = async () => {
    if (!recipieModal) {
      const fetchedRecipies = await fetchRecipies();
      console.log('testing print in toggle');
      console.log(fetchedRecipies);
      setRecipies(fetchedRecipies);
    }
    setRecipieModal(!recipieModal);
  };

  const fetchRecipies = async () => {
    const AvailableItems = items.map(item => item.name).join(', ');
    console.log(AvailableItems);
    console.log(items.length);
    try {
      const response = await fetch('/api/getRecipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ AvailableItems }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      // Handle the recipes data
      console.log(data.recipes);
      return data.recipes;
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };



  // Filtered items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 bg-slate-950 ${inter.className}`}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className='text-4xl p-4 text-center'>Pantry Tracker</h1>
        <div className="bg-slate-800 p-4 rounded-md">
          <form onSubmit={addItem} className="grid grid-cols-6 items-center text-slate-900">
            <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} type='text' placeholder="Item" className="placeholder-gray-600 col-span-2 bg-slate-400 p-2 rounded-md mx-2" />
            <input value={newItem.quan} onChange={(e) => setNewItem({ ...newItem, quan: e.target.value })} type='text' placeholder="Quantity" className="placeholder-gray-600 col-span-2 bg-slate-400 p-2 rounded-md mx-3" />
            <button type="submit" className="text-slate-200 bg-slate-500 hover:bg-sky-700 p-2 text-md rounded-full h-10 w-10 mx-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          </form>
          <div>
            <button onClick={toggleModal} type="button" className=" text-slate-200 bg-slate-500 hover:bg-sky-700 p-2 px-4 pt-3 text-md rounded-full mx-2 mt-3 inline-flex gap-2">
              <span>Add through image</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
            </button>
            <button onClick={toggleRecipieModal} type="button" className=" text-slate-200 bg-slate-500 hover:bg-sky-700 p-2 px-4 pt-3 text-md rounded-full mx-2 mt-3 inline-flex gap-2">
              <span>Generate Recipes</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
            </button>
          </div>
          <div className="my-4 relative w-5/6 mx-2">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="placeholder-gray-600 bg-slate-400 rounded-md w-full p-2 pl-4 pr-10 text-slate-900"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          </div>
          <ul>
            {filteredItems.map((item, id) => (
              <li key={id} className="my-4 p-2 px-4 w-full flex justify-between bg-slate-700 rounded-md">
                <div className="px-4 w-full flex justify-between">
                  <span className="capitalize">{item.name}</span>
                  <span>{item.quan}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className="mx-1 hover:text-slate-950 bg-slate-500 rounded-full h-5 w-5">X</button>
              </li>
            ))}
          </ul>
        </div>
        <div className={`modal ${modal ? 'block' : 'hidden'} fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50`}>
          <div className="modal-content bg-slate-800 p-6 rounded-md shadow-lg w-4/5 max-w-lg mx-auto">
            <h3 className="text-xl mb-4">Choose an option:</h3>
            <div className="flex flex-col gap-4">
              <button onClick={() => document.getElementById('camera-input').click()} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:text-slate-950" >  Take Photo (for mobile) </button>
              <button onClick={() => document.getElementById('file-input').click()} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:text-slate-950">Choose file</button>
              <input type="file" id="camera-input" accept="image/*" capture="camera" className="hidden" />
              <input type="file" id="file-input" accept="image/*" className="hidden" />
            </div>
            <button className='mt-4 close-modal bg-slate-600 text-white px-4 py-2 rounded-md hover:text-slate-950' onClick={toggleModal}>CLOSE</button>
          </div>
        </div>

        <div className={`modal ${recipieModal ? 'block' : 'hidden'} fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50`}>
          <div className="modal-content bg-slate-800 p-6 rounded-md shadow-lg w-4/5 max-w-lg mx-auto">
            <h3 className="text-xl mb-4">Response:</h3>
            <div className="flex flex-col gap-4">
              <p>{recipies}</p>
            </div>
            <button className='mt-4 close-modal bg-slate-600 text-white px-4 py-2 rounded-md hover:text-slate-950' onClick={toggleRecipieModal}>CLOSE</button>
          </div>
        </div>

      </div>
    </main>
  );
}