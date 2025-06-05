import React from 'react';
import './info.css';
import upload from "../assets/upload.png"
import history from "../assets/History.png"
import analyse from "../assets/analyse.png"
import { NavLink  } from "react-router-dom";


const Info = () => {
  return (
    <div className="info-container">
      <div className="info-header">
        <h1 className="header-title">Welcome to <span>Vis</span><span className="color-primary">tora</span>, Video Insight Platform</h1>
        <p className="header-description">
        The Video Insight Platform offers a transformative solution for engaging with educational and informative video content, empowering users to unlock the full potential of their learning materials. By uploading videos, users can harness advanced algorithms that generate structured summaries, extract key insights, and create visual breakdowns, facilitating a deeper understanding of complex subjects. This system is ideal for students, educators, researchers, and professionals who aim to enhance their productivity and learning efficiency. With features such as topic-based segmentation, keyword extraction, and sentiment analysis, the platform enables users to quickly distill the core ideas from lengthy videos, saving valuable time. For videos with minimal or no audio, a specialized visual analysis pipeline ensures that meaningful insights are still delivered, making the platform versatile across a wide range of content types. Whether you're studying for exams, conducting in-depth research, or exploring a new topic, the Video Insight Platform simplifies the process, delivering clarity and efficiency in every interaction.
        <br /><br />
         Beyond its analytical capabilities, the platform prioritizes user experience with intuitive features like a dedicated history page, allowing easy access to previously analyzed videos, and an enhanced video player equipped with chapter-based navigation for seamless exploration. Users can effortlessly jump to specific segments, review transcripts, and revisit summaries at their convenience, making it a perfect tool for quick reviews or detailed study sessions. The platform’s sleek, dark-themed interface ensures readability and focus, creating an environment conducive to learning. Built on modern machine learning pipelines, the Video Insight Platform combines cutting-edge technology with thoughtful design to help users extract actionable insights from dense video content. This makes it an essential resource for anyone seeking to streamline their learning or research workflow in today’s fast-paced digital landscape, offering both depth and accessibility in a single, powerful package.
        </p>
      </div>

      <section className="info-section-up">
        <div className="info-text wide">
          <h2 className="section-title">1. Upload Your Video</h2>
          <p className="section-description">
          Begin by uploading your video file through the intuitive upload panel, designed for a seamless user experience. The system automatically analyzes both audio and visuals, utilizing advanced algorithms to perform comprehensive summarization, keyword extraction, and precise segmentation. Simply drag and drop your video or browse your device to select the file, and the platform will handle the rest, ensuring a smooth and efficient process. You can track the upload progress in real-time, with clear indicators to keep you informed every step of the way. The platform supports a variety of video formats, such as MP4 and MOV, to accommodate diverse content needs. Once uploaded, the analysis begins immediately, breaking down your video into structured insights for quick and easy access.          </p>
          <p className="section-note">
            <strong>Supported formats:</strong> MP4, MOV. Ensure the video is not corrupted and contains speech or visible content for optimal results.
          </p>
          <NavLink to="/upload" className="links" activeclassname="active">Upload</NavLink>
        </div>
        <div className="info-image narrow">
          <img src={upload} alt="Upload video" className="section-image" />
        </div>
      </section>

      <section className="info-section reverse">
        <div className="info-text wide">
          <h2 className="section-title">2. History & Playback</h2>
          <p className="section-description">
          Easily access all your analyzed videos via the dedicated History page, a centralized hub for your content. View detailed transcripts, jump to specific segments with a click, and review concise summaries whenever needed. Each video entry includes captions, keywords, a high-level summary, and precise segment timings for seamless navigation. Videos are organized chronologically, with filters to sort by date or analysis status—fully analyzed or in progress. You can delete videos to manage your history or download analysis details, like summaries and keywords, as a PDF. Search functionality helps you quickly locate videos, making the History page an efficient tool for managing and revisiting content tailored to your needs          </p>
          <p className="section-note">
            The enhanced video player includes chapter-based navigation, making it easy to explore specific parts of the video.
          </p>
        <NavLink to="/history" className="links" activeclassname="active">History</NavLink>
        </div>
        <div className="info-image narrow">
          <img src={history} alt="History section" className="section-image" />
        </div>
      </section>

      <section className="info-section-down">
        <div className="info-text wide">
          <h2 className="section-title">3. Video Analysis & Insights</h2>
          <p className="section-description">
          After uploading a video, the platform conducts a detailed analysis using advanced machine learning to provide valuable insights. It generates a high-level GPT-style summary to capture the video’s main points, segments the content into topic-based chapters with timestamps for easy navigation, extracts key ideas from audio and visuals, and analyzes the emotional tone through sentiment analysis. These insights are enhanced with visual tools, including a segment duration timeline, a keyword pie chart, a semantic clustering scatter plot, and a sentiment-over-time graph, offering a clear and comprehensive understanding of the video’s content and mood.          </p>
          <p className="section-note">
            For videos with minimal or no speech, our visual understanding model generates insights from sampled frames.
          </p>
        <NavLink to="/analyse" className="links" activeclassname="active">Visualise</NavLink>
        </div>
        <div className="info-image narrow">
          <img src={analyse} alt="Video Analysis" className="section-image" />
        </div>
      </section>
      <p className="caution">
          ⚠️ Caution: Processing videos longer than 10 minutes may take 6–10 minutes. Videos with minimal or no audio will trigger a visual analysis pipeline, which may affect processing time and output style.
        </p>
    </div>
  );
};

export default Info;