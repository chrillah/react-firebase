import './App.css'
import { db, storage } from './firebase'
import {
    set,
    ref as ref_database,
    onValue,
    remove,
    update
} from 'firebase/database'
import {
    ref as ref_storage,
    uploadBytes,
    listAll,
    getDownloadURL
} from 'firebase/storage'
import { uid } from 'uid'
import { v4 } from 'uuid'
import { useState, useEffect } from 'react'

function App() {
    const [todo, setTodo] = useState('')
    const [todos, setTodos] = useState([])
    const [isEdit, setIsEdit] = useState(false)
    const [tempUUid, setTempUuid] = useState('')

    const [imageUpload, setImageUpload] = useState(null)
    const [imageList, setImageList] = useState([])
    const imageListRef = ref_storage(storage, 'images/')

    const handleTodoChange = (e) => {
        setTodo(e.target.value)
    }

    // write / create
    const writeToDatabase = () => {
        const uuid = uid()
        console.log(db)
        set(ref_database(db, `/${uuid}`), {
            todo,
            uuid
        })

        setTodo('')
    }

    // read
    useEffect(() => {
        onValue(ref_database(db), (snapshot) => {
            setTodos([])
            const data = snapshot.val()
            if (data !== null) {
                Object.values(data).map((todo) => {
                    setTodos((oldArray) => [...oldArray, todo])
                })
            }
        })
    }, [])

    // update
    const handleUpdate = (todo) => {
        setIsEdit(true)
        setTempUuid(todo.uuid)
        setTodo(todo.todo)
    }

    const handleSubmitChange = () => {
        update(ref_database(db, `/${tempUUid}`), {
            todo,
            uuid: tempUUid
        })
        setTodo('')
        setIsEdit(false)
    }

    // delete
    const handleDelete = (todo) => {
        remove(ref_database(db, `/${todo.uuid}`))
    }

    // upload shit
    const uploadImage = () => {
        if (imageUpload === null) {
            return
        } else {
            const imageRef = ref_storage(
                storage,
                `images/${imageUpload.name + v4()}`
            )
            uploadBytes(imageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    setImageList((prev) => [...prev, url])
                })
                alert('image uploaded')
            })
        }
    }

    useEffect(() => {
        setImageList([]);
        listAll(imageListRef).then((resp) => {
            resp.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                    setImageList((prev) => [...prev, url])
                })
            })
        })
    }, [])

    return (
        <div className="App">
            <input type="text" value={todo} onChange={handleTodoChange} />
            {isEdit ? (
                <>
                    <button onClick={handleSubmitChange}>submit change</button>
                    <button
                        onClick={() => {
                            setIsEdit(false)
                            setTodo('')
                        }}
                    >
                        X
                    </button>
                </>
            ) : (
                <button onClick={writeToDatabase}>submit</button>
            )}
            {todos.map((todo, index) => (
                <div key={index}>
                    <h1>{todo.todo}</h1>
                    <button onClick={() => handleUpdate(todo)}>update</button>
                    <button onClick={() => handleDelete(todo)}>delete</button>
                </div>
            ))}
            <div className="upload-shit">
                <input
                    type="file"
                    onChange={(event) => {
                        setImageUpload(event.target.files[0])
                    }}
                />
                <button onClick={uploadImage}>Upload</button>

                <div className="list-container">
                    {imageList.map((url, index) => (
                        <img key={index} src={url} alt="bilder" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default App
