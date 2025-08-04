#!/usr/bin/env python3

import sys
import os

def test_imports():
    """Test if all required packages can be imported."""
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    try:
        import sqlalchemy
        print("✅ SQLAlchemy imported successfully")
    except ImportError as e:
        print(f"❌ SQLAlchemy import failed: {e}")
        return False
    
    try:
        import langchain
        print("✅ LangChain imported successfully")
    except ImportError as e:
        print(f"❌ LangChain import failed: {e}")
        return False
    
    return True

def test_backend_app():
    """Test if the backend app can be created."""
    try:
        sys.path.append('backend')
        from main import app
        print("✅ Backend app created successfully")
        return True
    except Exception as e:
        print(f"❌ Backend app creation failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing MindMate setup...")
    print()
    
    # Test imports
    imports_ok = test_imports()
    print()
    
    # Test backend app
    app_ok = test_backend_app()
    print()
    
    if imports_ok and app_ok:
        print("🎉 All tests passed! MindMate is ready to run.")
        print()
        print("To start the backend:")
        print("cd backend && python -m uvicorn main:app --reload")
        print()
        print("To start the frontend:")
        print("cd frontend && npm run dev")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1) 