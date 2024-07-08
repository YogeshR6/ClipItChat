import Input from '../components/Input.jsx';
import {
    Form, Link,
    useSearchParams,
    useNavigation
} from 'react-router-dom';

export default function AuthForm() {
    const navigation = useNavigation();
    const [searchParams] = useSearchParams();
    const isLogin = searchParams.get('mode') === 'login';
    const isSubmitting = navigation.state === 'submitting';
    return (
        <>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <Form>
                <Input label='Email' id='email' type='email' name='Email' />
                <Input label='Password' id='password' type='password' minLength='8' name='Password' />
                <button disabled={isSubmitting} className='bg-blue-600 text-stone-50 p-2 px-4 hover:bg-cyan-600 rounded-lg w-1/12' type='submit'>
                    Submit
                </button>
            </Form>
            {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
            <Link to={isLogin ? '/auth?mode=signup' : '/auth?mode=login'} className='text-blue-400'>
                {isLogin ? 'Sign Up' : 'Login'}
            </Link>
            {/* <hr style={{ width: '30%' }} />OR<hr style={{ width: '30%' }} /> */}
            <div>
                <button disabled={isSubmitting} className='border border-blue-600 text-stone-50 p-2 px-4 hover:bg-cyan-600 hover:border-cyan-600 rounded-lg' type='submit'>
                    {isLogin ? 'Login ' : 'Sign Up '} with Google
                </button>
            </div>
        </>)
}


