import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'
import axiosWithAuth from '../axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  const navigate = useNavigate()
  const redirectToLogin = () => navigate('/');
  const redirectToArticles = () => navigate('/articles');

  const logout = () => {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      setMessage('Goodbye!');
    }
    redirectToLogin();
  }

  const login = async ({ username, password }) => {
    setMessage('');

    try {
      setSpinnerOn(true);
      const response = await axios.post(loginUrl, { username, password });
      localStorage.setItem('token', response.data.token);
      redirectToArticles();
    } catch (err) {
      console.error(err);
    } finally {
      setSpinnerOn(false);
    }
  }

  const getArticles = async () => {
    setMessage('');

    try {
      setSpinnerOn(true);
      const response = await axiosWithAuth().get(articlesUrl);
      setMessage(response.data.message);
      setArticles(response.data.articles);
    } catch (err) {
      console.error(err);
      if (err.status === 401) redirectToLogin();
    } finally {
      setSpinnerOn(false);
    }
  }

  const postArticle = async article => {
    setSpinnerOn(true);

    try {
      const response = await axiosWithAuth().post(articlesUrl, article);
      // re-fetch the updated articles
      await getArticles();
      setMessage(response.data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setSpinnerOn(false);
    }
  }

  const updateArticle = async ({ article_id, article }) => {
    setSpinnerOn(true);
    try {
      const response = await axiosWithAuth().put(`${articlesUrl}/${article_id}`, article);
      // re-fetch the updated articles
      await getArticles();
      setCurrentArticleId(null);
      setMessage(response.data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setSpinnerOn(false);
    }
  }

  const deleteArticle = async article_id => {
    setSpinnerOn(true);
    try {
      const response = await axiosWithAuth().delete(`http://localhost:9000/api/articles/${article_id}`);
      await getArticles();
      setMessage(response.data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setSpinnerOn(false);
    }
  }

  return (
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm
                currentArticle={articles.find(art => art.article_id === currentArticleId)}
                postArticle={postArticle}
                setCurrentArticleId={setCurrentArticleId}
                updateArticle={updateArticle}
              />
              <Articles
                articles={articles}
                getArticles={getArticles}
                currentArticleId={currentArticleId}
                deleteArticle={deleteArticle}
                setCurrentArticleId={setCurrentArticleId}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
