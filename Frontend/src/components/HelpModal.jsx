import React from 'react';
import Crop_Rec from  '../Training video/Crop_Rec.mp4' 
import Gov_APMC from '../Training video/Gov_APMC.mp4'; 
import Gov_Sch from '../Training video/Gov_Sch.mp4'; 
import Local_Markets from '../Training video/Local_Markets.mp4'; 
import Post_Crop from '../Training video/Post_Crop.mp4'; 
import Smart_Decision_Building from '../Training video/Smart_Decision_Building.mp4'; 
import User_How_to_Buy_crops from '../Training video/User_How_to_Buy_crops.mp4'; 


import '../css/HelpModal.css';

const HelpModal = ({ onClose }) => {
  const videoContent = {
    farmer: [
      { title: "Crop Recommendation System", video: Crop_Rec },
      { title: "Goverment APMC", video: Gov_APMC },
      { title: "Goverment Scheme", video: Gov_Sch },
      { title: "Local Market", video: Local_Markets },
      { title: "Post Crop ", video: Post_Crop },
      { title: "Smart Decision Building", video: Smart_Decision_Building }

    ],
    user: [
      { title: "How to Order", video: User_How_to_Buy_crops },
    ]
  };

  return (
    <div className="Helpmodel_overlay">
      <div className="Helpmodel_content">
        <button className="Helpmodel_close-btn" onClick={onClose}>&times;</button>
        <h2 className="Helpmodel_title">Help Center</h2>
        
        <div className="Helpmodel_video-sections">
          <div className="Helpmodel_section">
            <h3 className="Helpmodel_farmer-title">Farmer Guides</h3>
            <div className="Helpmodel_videos-container">
              {videoContent.farmer.map((item, index) => (
                <div key={`farmer-${index}`} className="Helpmodel_video-item">
                  <h4 className="Helpmodel_video-title">{item.title}</h4>
                  <div className="Helpmodel_video-wrapper">
                    {item.video.includes('http') ? (
                      <iframe
                        src={item.video}
                        title={item.title}
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video controls width="100%">
                        <source src={item.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="Helpmodel_section">
            <h3 className="Helpmodel_user-title">User Guides</h3>
            <div className="Helpmodel_videos-container">
              {videoContent.user.map((item, index) => (
                <div key={`user-${index}`} className="Helpmodel_video-item">
                  <h4 className="Helpmodel_video-title">{item.title}</h4>
                  <div className="Helpmodel_video-wrapper">
                    {item.video.includes('http') ? (
                      <iframe
                        src={item.video}
                        title={item.title}
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video controls width="100%">
                        <source src={item.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
