import './Home.css'
import { FaCirclePlay, FaArrowUp } from 'react-icons/fa6';
import { FaRegEnvelope } from 'react-icons/fa';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../../contexts/ServiceContext';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const authService = useAuthService();

    const handleLogin = (): void => {
        if(authService.isAuthenticated()){
            navigate('/dashboard');
        }else{
            navigate('/login');
        }
    };

    return (
        <section id="dashboard">
            <section className="left">
                <div className="left-top">
                    <header>
                        <img src="/logo.png" alt="Icon" className="icon" />
                        <nav>
                            <a href="/" className="active">Home</a>
                            <a href="/pricing">Pricing</a>
                            <a href="/about">About</a>
                            <a href="/contact">Contact</a>
                            <a href="#" onClick={handleLogin} className="library">Dig In Now</a>
                        </nav>
                    </header>
                    <h2>Where Journeys<br /> Begin with Trust</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing sed do eiusmod tempor<br />incididunt ut labore dolore magna aliqua ut enim elit ad minim veniam quis<br />nostrud exercitation ulla laboris nisi ut aliquip.</p>

                    <div className="lt-actions">
                        <button className="btn">Learn More</button>
                        <button className="btn">
                            <FaCirclePlay style={{marginRight: '0.5rem', fontSize: '2.4rem'}}/>
                            See How It Works
                        </button>
                    </div>
                </div>
                <div className="left-bottom">
                    <section className="lb-left">
                        <div>
                            <span className="since">SINCE</span>
                            <h4>31 Dec <br />2024</h4>
                            <p>Total Buses <span>500</span></p>
                            <p>Total Students <span>3000</span></p>
                        </div>
                        <div>
                            <span className="circle"><FaArrowUp /></span>
                        </div>
                    </section>
                    <section className="lb-right">
                        <h4>so many parents <br />chose us</h4>
                        <div className="lb-container">
                            <p>
                                <span>+1235</span>
                                <span>Satisfied parents</span>
                            </p>
                            <div className="parents">
                                <img src="/parent-1.jpg" alt="Parent 1" className="parent" />
                                <img src="/parent-3.jpg" alt="Parent 3" className="parent" />
                                <img src="/parent-2.jpg" alt="Parent 2" className="parent" />
                            </div>
                        </div>
                    </section>
                </div>
            </section>
            <section className="right">
                <div className="right-top">
                    <div className="rt-actions">
                        <a href="#"><FaRegEnvelope /></a>
                        <a href="#" onClick={handleLogin}>Dig In Now</a>
                    </div>
                    <img src="/right.jpg" alt="Right Top Picture" className="right-img" />
                </div>
                <div className="right-bottom">
                    <div className="rb-parent">
                        <img src="/driver.jpg" alt="Driver" />
                    </div>
                    <div className="rb-info">
                        <h4>Jolene Doe</h4>
                        <span>Verified Driver</span>

                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore dolore magna aliqua ut enim ad minim veniam, quis nostrud exercitation ulla.
                        </p>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default Home; 