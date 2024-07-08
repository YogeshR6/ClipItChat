import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/RootLayout.jsx';
import Home from './pages/Home.jsx';
import Posts from './pages/Posts.jsx';
import AuthenticationPage from './pages/AuthenticationPage.jsx';
import Profile from './pages/Profile.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Post from './pages/Post.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'posts', element: <Posts />,
        children: [
          { path: 'new', element: <CreatePost /> },
          { path: ':id', element: <Post /> }
        ]
      },
      { path: 'auth', element: <AuthenticationPage /> },
      { path: 'profile', element: <Profile /> },
    ]
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
