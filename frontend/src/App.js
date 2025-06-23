import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    site: '',
    worker: '',
    controlledBy: '',
    
    // Hall entrances
    hallElevators: '',
    hallGlassDoors: '',
    hallMailboxes: '',
    hallHoseReels: '',
    hallCarpets: '',
    hallComments: '',
    hallPhoto: '',
    
    // Corridors
    corridorEdges: '',
    corridorHoseReels: '',
    corridorFloors: '',
    corridorComments: '',
    corridorPhoto: '',
    
    // Stairs
    stairRailings: '',
    stairCorners: '',
    stairSpiderWebs: '',
    stairComments: '',
    stairPhoto: '',
    
    // Technical skills
    techProcedures: '',
    techMaterial: '',
    techSafety: '',
    techAutonomy: '',
    
    // Professional behavior
    profPunctuality: '',
    profAttitude: '',
    profInstructions: '',
    profMotivation: '',
    
    globalEvaluation: '',
    workerSignature: '',
    supervisorSignature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [currentCamera, setCurrentCamera] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoSection, setCurrentPhotoSection] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startCamera = async (section) => {
    try {
      setCurrentPhotoSection(section);
      setShowCamera(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      setCurrentCamera(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (currentCamera) {
      currentCamera.getTracks().forEach(track => track.stop());
      setCurrentCamera(null);
    }
    setShowCamera(false);
    setCurrentPhotoSection('');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      
      setFormData(prev => ({
        ...prev,
        [`${currentPhotoSection}Photo`]: photoData
      }));
      
      stopCamera();
    }
  };

  const handlePhotoUpload = (e, section) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          [`${section}Photo`]: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderRadioGroup = (name, label) => {
    const options = [
      { value: 'bien', label: 'Bien', color: 'text-green-600' },
      { value: 'satisfaisant', label: 'Satisfaisant', color: 'text-yellow-600' },
      { value: 'insuffisant', label: 'Insuffisant', color: 'text-red-600' }
    ];

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex space-x-6">
          {options.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={formData[name] === option.value}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className={`${option.color} font-medium`}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await axios.post(`${API}/cleaning-report`, formData);
      setSubmitStatus('Rapport envoyé avec succès!');
      console.log('Report submitted:', response.data);
    } catch (error) {
      setSubmitStatus('Erreur lors de l\'envoi du rapport.');
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with Logo */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Brigade de Nettoyage</h1>
            <p className="text-gray-600">Contrôle de nettoyage des parties communes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                <input
                  type="text"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ouvrier</label>
                <input
                  type="text"
                  name="worker"
                  value={formData.worker}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contrôlé par</label>
                <input
                  type="text"
                  name="controlledBy"
                  value={formData.controlledBy}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Hall Entrances */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contrôle halls d'entrées</h2>
            <div className="space-y-4">
              {renderRadioGroup('hallElevators', 'Ascenseurs')}
              {renderRadioGroup('hallGlassDoors', 'Portes vitrées')}
              {renderRadioGroup('hallMailboxes', 'Boîtes aux lettres')}
              {renderRadioGroup('hallHoseReels', 'Dévidoirs')}
              {renderRadioGroup('hallCarpets', 'Tapis')}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Évaluation et commentaires</label>
                <textarea
                  name="hallComments"
                  value={formData.hallComments}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prise de photo</label>
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => startCamera('hall')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Prendre photo</span>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'hall')}
                      className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  {formData.hallPhoto && (
                    <div className="relative">
                      <img src={formData.hallPhoto} alt="Hall" className="max-w-xs rounded-md border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, hallPhoto: ''}))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Corridors */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contrôle couloirs</h2>
            <div className="space-y-4">
              {renderRadioGroup('corridorEdges', 'Bord des couloirs')}
              {renderRadioGroup('corridorHoseReels', 'Dévidoirs')}
              {renderRadioGroup('corridorFloors', 'Sols')}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Évaluation et commentaires</label>
                <textarea
                  name="corridorComments"
                  value={formData.corridorComments}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prise de photo</label>
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => startCamera('corridor')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Prendre photo</span>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'corridor')}
                      className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  {formData.corridorPhoto && (
                    <div className="relative">
                      <img src={formData.corridorPhoto} alt="Corridor" className="max-w-xs rounded-md border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, corridorPhoto: ''}))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stairs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contrôle des escaliers</h2>
            <div className="space-y-4">
              {renderRadioGroup('stairRailings', 'Rampes')}
              {renderRadioGroup('stairCorners', 'Coins')}
              {renderRadioGroup('stairSpiderWebs', 'Toiles d\'araignées')}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Évaluation et commentaires</label>
                <textarea
                  name="stairComments"
                  value={formData.stairComments}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prise de photo</label>
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => startCamera('stair')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Prendre photo</span>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'stair')}
                      className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  {formData.stairPhoto && (
                    <div className="relative">
                      <img src={formData.stairPhoto} alt="Stairs" className="max-w-xs rounded-md border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, stairPhoto: ''}))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Worker Evaluation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Évaluation du travailleur et art.60</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Compétences techniques</h3>
            <div className="space-y-4 mb-6">
              {renderRadioGroup('techProcedures', 'Respect des procédures de nettoyage (produits, fréquences, hygiène)')}
              {renderRadioGroup('techMaterial', 'Utilisation correcte du matériel (aspirateur, autolaveuse, etc.)')}
              {renderRadioGroup('techSafety', 'Respect des consignes de sécurité')}
              {renderRadioGroup('techAutonomy', 'Autonomie dans l\'exécution des tâches')}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">🤝 Comportement professionnel</h3>
            <div className="space-y-4 mb-6">
              {renderRadioGroup('profPunctuality', 'Ponctualité et assiduité')}
              {renderRadioGroup('profAttitude', 'Attitude respectueuse envers les collègues et les usagers')}
              {renderRadioGroup('profInstructions', 'Capacité à recevoir des consignes et à s\'adapter')}
              {renderRadioGroup('profMotivation', 'Motivation et implication dans le travail')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Évaluation globale</label>
              <textarea
                name="globalEvaluation"
                value={formData.globalEvaluation}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Signatures */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Signatures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature du travailleur</label>
                <input
                  type="text"
                  name="workerSignature"
                  value={formData.workerSignature}
                  onChange={handleInputChange}
                  placeholder="Nom du travailleur"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature responsable</label>
                <input
                  type="text"
                  name="supervisorSignature"
                  value={formData.supervisorSignature}
                  onChange={handleInputChange}
                  placeholder="Nom du responsable"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le rapport'}
            </button>
            
            {submitStatus && (
              <div className={`mt-4 p-3 rounded-md text-center font-semibold ${
                submitStatus.includes('succès') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {submitStatus}
              </div>
            )}
          </div>
        </form>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Prendre une photo</h3>
                <button
                  onClick={stopCamera}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-200 rounded-md object-cover"
                />
                
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={takePhoto}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Capturer</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;