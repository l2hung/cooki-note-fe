import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddRecipe.css';

// Icons
const CloseIcon = () => <>&#10005;</>;
const CameraIcon = () => <>&#128247;</>;
const DragHandleIcon = () => <>&#9776;</>;

const AddRecipe = () => {
    const navigate = useNavigate();

    // State for form data
    const [recipeData, setRecipeData] = useState({
        title: '',
        description: '',
        cookTimeMinutes: 30,
        servings: 2,
        difficulty: 'EASY',
        ingredients: [{ name: '', quantity: '', unit: '' }],
        steps: [{ description: '', imageFile: null, imagePreview: '', mediaId: null }],
    });

    // State for image files and previews
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [mainImageMediaId, setMainImageMediaId] = useState(null);

    // State for ingredient suggestions
    const [suggestedIngredients, setSuggestedIngredients] = useState([]);

    // State for UI feedback
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for hidden file inputs
    const mainImageInputRef = useRef(null);
    const stepImageInputRef = useRef(null);

    const apiClient = axios.create({
        baseURL: '/api/v1',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
    });

    // --- EVENT HANDLERS ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRecipeData({ ...recipeData, [name]: value });
    };

    // --- Main Image Handling ---
    const handleMainImageSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));

            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await apiClient.post('/media/upload', formData);
                setMainImageMediaId(res.data.data.id);
                console.log("Main image uploaded, mediaId:", res.data.data.id); // Corrected log
            } catch (err) {
                console.error("Lỗi tải ảnh đại diện:", err);
                setError("Không thể tải ảnh đại diện.");
                setMainImageFile(null);
                setMainImagePreview('');
                setMainImageMediaId(null);
            }
        }
    };

    // --- Ingredient Handling ---
    const handleIngredientChange = (index, e) => {
        const { name, value } = e.target; // Get name and value from the event target
        const newIngredients = [...recipeData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [name]: value }; // Update the specific field
        setRecipeData({ ...recipeData, ingredients: newIngredients });
    };


    const handleIngredientNameSearch = async (index, e) => {
        handleIngredientChange(index, e); // Call the general handler first
        const keyword = e.target.value;
        if (keyword.length > 2) {
            try {
                // Replace with actual API call if available
                // const response = await apiClient.get(`/ingredients/search?name=${keyword}`);
                // setSuggestedIngredients(response.data.data);
                 setSuggestedIngredients([ { id: 1, name: 'Bột mì' }, { id: 2, name: 'Đường' }, { id: 3, name: 'Trứng gà' }]);
            } catch (err) {
                console.error("Lỗi khi tìm nguyên liệu:", err);
            }
        } else {
             setSuggestedIngredients([]); // Clear suggestions if keyword is short
        }
    };

    const handleAddIngredient = () => setRecipeData({...recipeData, ingredients: [...recipeData.ingredients, { name: '', quantity: '', unit: '' }]});
    const handleRemoveIngredient = (index) => {
        const newIngredients = [...recipeData.ingredients];
        newIngredients.splice(index, 1);
        setRecipeData({ ...recipeData, ingredients: newIngredients });
    };

    // --- Step Handling ---
     const handleStepChange = (index, e) => {
        const { name, value } = e.target; // Use name (should be 'description') and value
        const newSteps = [...recipeData.steps];
        newSteps[index] = { ...newSteps[index], [name]: value }; // Update description
        setRecipeData({ ...recipeData, steps: newSteps });
    };


    const handleStepImageSelect = async (index, e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a temporary preview URL immediately
             const previewUrl = URL.createObjectURL(file);

            // Update state optimistically with preview and file, reset mediaId
            setRecipeData(prevData => {
                 const newSteps = [...prevData.steps];
                 if(newSteps[index]){ // Check if step exists
                     newSteps[index] = {
                         ...newSteps[index],
                         imageFile: file,
                         imagePreview: previewUrl,
                         mediaId: null // Reset mediaId while uploading
                     };
                 }
                 return { ...prevData, steps: newSteps };
            });


            // Upload the file
            const formData = new FormData();
            formData.append('file', file);
             try {
                const res = await apiClient.post('/media/upload', formData);
                const uploadedMediaId = res.data.data.id;

                // Update the state again with the actual mediaId
                setRecipeData(prevData => {
                    const updatedSteps = [...prevData.steps];
                    if(updatedSteps[index]){ // Check again
                        updatedSteps[index] = { ...updatedSteps[index], mediaId: uploadedMediaId };
                    }
                    return { ...prevData, steps: updatedSteps };
                });
                console.log(`Step ${index} image uploaded, mediaId:`, uploadedMediaId); // Corrected log

            } catch (err) {
                console.error(`Lỗi tải ảnh bước ${index}:`, err);
                setError(`Không thể tải ảnh cho bước ${index + 1}.`);
                // Revert state on error
                setRecipeData(prevData => {
                     const errorSteps = [...prevData.steps];
                      if(errorSteps[index]){
                         errorSteps[index] = { ...errorSteps[index], imageFile: null, imagePreview: '', mediaId: null };
                      }
                     return { ...prevData, steps: errorSteps };
                });
            }
        }
    };


    const handleAddStep = () => setRecipeData({...recipeData, steps: [...recipeData.steps, { description: '', imageFile: null, imagePreview: '', mediaId: null }]});
    const handleRemoveStep = (index) => {
        // Optional: Clean up preview URL before removing
        const stepToRemove = recipeData.steps[index];
        if (stepToRemove && stepToRemove.imagePreview) {
            URL.revokeObjectURL(stepToRemove.imagePreview);
        }

        const newSteps = [...recipeData.steps];
        newSteps.splice(index, 1);
        setRecipeData({ ...recipeData, steps: newSteps });
    };


    // --- FORM SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Optional: Revoke preview URLs before submitting to free up memory
        if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
        recipeData.steps.forEach(step => {
            if (step.imagePreview) URL.revokeObjectURL(step.imagePreview);
        });


        try {
            // Prepare steps payload (only description and mediaId)
            const stepsPayload = recipeData.steps.map(step => ({
                description: step.description,
                mediaId: step.mediaId
            }));

            // Prepare final data
            const finalRecipeData = {
                title: recipeData.title,
                description: recipeData.description,
                cookTimeMinutes: recipeData.cookTimeMinutes,
                servings: recipeData.servings,
                difficulty: recipeData.difficulty,
                mainImageMediaId: mainImageMediaId,
                ingredients: recipeData.ingredients.map(({name, quantity, unit}) => ({ name, quantity, unit })), // Ensure only needed fields are sent
                steps: stepsPayload,
            };

            console.log("Submitting final data:", finalRecipeData);

            // Post recipe data
            const response = await apiClient.post('/recipes', finalRecipeData);

            // Navigate on success
            navigate(`/recipe/${response.data.data.id}`);

        } catch (err) {
            console.error("Lỗi khi tạo công thức:", err);
            setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tạo công thức. Vui lòng thử lại.");
            setIsSubmitting(false);
             // Re-create preview URLs if submission failed and user needs to see them again (optional, complex)
             // Or simply let them re-select images if needed.
        }
         // No finally block to reset submitting, as navigate happens on success
    };

    // --- JSX RENDER ---
    return (
        <div className="add-recipe-wrapper">
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <header className="add-recipe-header">
                    <button type="button" onClick={() => navigate(-1)} className="close-btn"><CloseIcon /></button>
                    <div className="header-actions">
                        <button type="submit" className="publish-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang đăng...' : 'Lên Sóng'}
                        </button>
                    </div>
                </header>

                {/* Hidden file input for main image */}
                <input type="file" ref={mainImageInputRef} onChange={handleMainImageSelect} accept="image/*" style={{ display: 'none' }} />

                {/* Main image upload section */}
                <div className="image-upload-section" onClick={() => mainImageInputRef.current.click()}>
                    {mainImagePreview ? <img src={mainImagePreview} alt="Xem trước" className="image-preview" /> : <div className="image-placeholder"><CameraIcon /></div>}
                    <button type="button" className="upload-text-btn">Đăng hình đại diện món ăn</button>
                </div>

                {/* Basic info section */}
                <div className="form-section">
                    <input type="text" name="title" placeholder="Tên món..." value={recipeData.title} onChange={handleInputChange} className="title-input" required />
                    <textarea name="description" placeholder="Mô tả..." value={recipeData.description} onChange={handleInputChange} className="description-input"></textarea>
                    <div className="meta-grid">
                        <div className="meta-item"><label>Khẩu phần</label><input type="number" name="servings" value={recipeData.servings} onChange={handleInputChange} min="1" /></div>
                        <div className="meta-item"><label>Thời gian nấu</label><input type="text" name="cookTimeMinutes" placeholder="30 phút" value={recipeData.cookTimeMinutes} onChange={handleInputChange} /></div>
                         <div className="meta-item"> {/* Added Difficulty field */}
                            <label>Độ khó</label>
                            <select name="difficulty" value={recipeData.difficulty} onChange={handleInputChange}>
                                <option value="EASY">Dễ</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HARD">Khó</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Nguyên Liệu</h2>
                    {recipeData.ingredients.map((ing, index) => (
                        <div key={index} className="dynamic-field ingredient-field"> {/* Thêm class để style riêng nếu cần */}
                            <span className="drag-handle"><DragHandleIcon /></span>
                            
                            {/* Input Tên Nguyên Liệu */}
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Tên nguyên liệu (VD: Sườn non)" 
                                value={ing.name} 
                                onChange={(e) => handleIngredientNameSearch(index, e)} 
                                list="ingredient-suggestions" 
                                required 
                                className="ingredient-name" 
                            />
                            
                            {/* Input Số Lượng (Quantity) */}
                            <input 
                                type="text" 
                                name="quantity" 
                                placeholder="Số lượng (VD: 750)" 
                                value={ing.quantity} 
                                onChange={(e) => handleIngredientChange(index, e)} 
                                className="ingredient-quantity"
                                required // <-- Bắt buộc nhập
                            />

                            {/* Input Đơn Vị (Unit) */}
                            <input 
                                type="text" 
                                name="unit" 
                                placeholder="Đơn vị (VD: g, ml, quả)" 
                                value={ing.unit} 
                                onChange={(e) => handleIngredientChange(index, e)} 
                                className="ingredient-unit" 
                            />

                            <button type="button" onClick={() => handleRemoveIngredient(index)} className="remove-btn">&times;</button>
                        </div>
                    ))}
                    <datalist id="ingredient-suggestions">
                        {suggestedIngredients.map(sug => <option key={sug.id} value={sug.name} />)}
                    </datalist>
                    <button type="button" onClick={handleAddIngredient} className="add-btn">+ Nguyên liệu</button>
                </div>

                {/* Steps section */}
                <div className="form-section">
                    <h2>Cách Làm</h2>
                    {/* Hidden file input for steps */}
                    <input type="file" ref={stepImageInputRef} onChange={(e) => handleStepImageSelect(stepImageInputRef.current.dataset.index, e)} accept="image/*" style={{ display: 'none' }}/>
                    {recipeData.steps.map((step, index) => (
                        <div key={index} className="dynamic-field step-field">
                            <div className="step-header">
                                <span className="step-number">{index + 1}</span>
                                <span className="drag-handle"><DragHandleIcon /></span>
                            </div>
                            <div className="step-content">
                                <textarea name="description" placeholder="Mô tả bước làm..." value={step.description} onChange={(e) => handleStepChange(index, e)} required></textarea>
                                {/* Step image upload area */}
                                <div className="step-image-upload" onClick={() => { stepImageInputRef.current.dataset.index = index; stepImageInputRef.current.click(); }}>
                                    {step.imagePreview ? <img src={step.imagePreview} alt={`Xem trước bước ${index + 1}`} className="step-image-preview" /> : <CameraIcon />}
                                </div>
                            </div>
                            <button type="button" onClick={() => handleRemoveStep(index)} className="remove-btn step-remove-btn">&times;</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStep} className="add-btn">+ Thêm bước</button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default AddRecipe;