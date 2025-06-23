#!/usr/bin/env python3
import requests
import json
import time
import uuid
import base64
import os
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure the URL doesn't have quotes
BACKEND_URL = BACKEND_URL.strip('"\'')
API_URL = f"{BACKEND_URL}/api"

print(f"Testing API at: {API_URL}")

# Test data for cleaning report
def generate_test_report():
    # Generate a small base64 image for testing
    sample_image = base64.b64encode(b"test image data").decode('utf-8')
    
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "site": "Test Building Complex",
        "worker": "Jean Dupont",
        "controlledBy": "Marie Supervisor",
        
        # Hall entrances
        "hallElevators": "bien",
        "hallGlassDoors": "satisfaisant",
        "hallMailboxes": "bien",
        "hallHoseReels": "satisfaisant",
        "hallCarpets": "insuffisant",
        "hallComments": "Les tapis nécessitent un nettoyage plus approfondi",
        "hallPhoto": sample_image,
        
        # Corridors
        "corridorEdges": "bien",
        "corridorHoseReels": "bien",
        "corridorFloors": "satisfaisant",
        "corridorComments": "Couloirs bien entretenus dans l'ensemble",
        "corridorPhoto": sample_image,
        
        # Stairs
        "stairRailings": "satisfaisant",
        "stairCorners": "insuffisant",
        "stairSpiderWebs": "bien",
        "stairComments": "Les coins des escaliers ont besoin d'attention",
        "stairPhoto": sample_image,
        
        # Technical skills
        "techProcedures": "bien",
        "techMaterial": "satisfaisant",
        "techSafety": "bien",
        "techAutonomy": "satisfaisant",
        
        # Professional behavior
        "profPunctuality": "bien",
        "profAttitude": "bien",
        "profInstructions": "satisfaisant",
        "profMotivation": "bien",
        
        # Global evaluation
        "globalEvaluation": "Travail satisfaisant dans l'ensemble. Quelques points à améliorer.",
        "workerSignature": "data:image/png;base64," + sample_image,
        "supervisorSignature": "data:image/png;base64," + sample_image
    }

def test_root_endpoint():
    print("\n=== Testing Root Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert "message" in response.json()
        print("✅ Root endpoint test passed")
        return True
    except Exception as e:
        print(f"❌ Root endpoint test failed: {str(e)}")
        return False

def test_create_cleaning_report():
    print("\n=== Testing POST /cleaning-report Endpoint ===")
    try:
        test_data = generate_test_report()
        response = requests.post(f"{API_URL}/cleaning-report", json=test_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error Response: {response.text}")
            return False, None
            
        result = response.json()
        print(f"Created report with ID: {result.get('id')}")
        
        # Verify all fields were saved correctly
        for key, value in test_data.items():
            assert key in result, f"Field {key} missing in response"
            if key not in ['hallPhoto', 'corridorPhoto', 'stairPhoto', 'workerSignature', 'supervisorSignature']:
                assert result[key] == value, f"Field {key} has incorrect value"
        
        print("✅ Create cleaning report test passed")
        return True, result.get('id')
    except Exception as e:
        print(f"❌ Create cleaning report test failed: {str(e)}")
        return False, None

def test_get_all_cleaning_reports():
    print("\n=== Testing GET /cleaning-reports Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/cleaning-reports")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error Response: {response.text}")
            return False
            
        reports = response.json()
        print(f"Retrieved {len(reports)} reports")
        
        # Verify we have at least one report
        assert len(reports) > 0, "No reports found"
        
        # Check structure of first report
        first_report = reports[0]
        required_fields = [
            "id", "date", "site", "worker", "controlledBy",
            "hallElevators", "corridorEdges", "stairRailings",
            "techProcedures", "profPunctuality", "globalEvaluation"
        ]
        
        for field in required_fields:
            assert field in first_report, f"Required field {field} missing in report"
        
        print("✅ Get all cleaning reports test passed")
        return True
    except Exception as e:
        print(f"❌ Get all cleaning reports test failed: {str(e)}")
        return False

def test_get_specific_cleaning_report(report_id):
    print(f"\n=== Testing GET /cleaning-report/{report_id} Endpoint ===")
    try:
        response = requests.get(f"{API_URL}/cleaning-report/{report_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error Response: {response.text}")
            return False
            
        report = response.json()
        print(f"Retrieved report with ID: {report.get('id')}")
        
        # Verify report ID matches
        assert report.get('id') == report_id, f"Report ID mismatch: {report.get('id')} != {report_id}"
        
        # Check for required fields
        required_fields = [
            "date", "site", "worker", "controlledBy",
            "hallElevators", "corridorEdges", "stairRailings",
            "techProcedures", "profPunctuality", "globalEvaluation"
        ]
        
        for field in required_fields:
            assert field in report, f"Required field {field} missing in report"
        
        print("✅ Get specific cleaning report test passed")
        return True
    except Exception as e:
        print(f"❌ Get specific cleaning report test failed: {str(e)}")
        return False

def test_nonexistent_report():
    print("\n=== Testing GET with Non-existent Report ID ===")
    try:
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/cleaning-report/{fake_id}")
        print(f"Status Code: {response.status_code}")
        
        # Should return 404 for non-existent report
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        print("✅ Non-existent report test passed")
        return True
    except Exception as e:
        print(f"❌ Non-existent report test failed: {str(e)}")
        return False

def test_different_evaluation_values():
    print("\n=== Testing Different Evaluation Values ===")
    try:
        # Test with all "bien" values
        test_data = generate_test_report()
        for key in test_data:
            if key.startswith(("hall", "corridor", "stair", "tech", "prof")) and key.endswith(("s", "rs")):
                test_data[key] = "bien"
        
        response = requests.post(f"{API_URL}/cleaning-report", json=test_data)
        assert response.status_code == 200, f"Failed to create report with 'bien' values: {response.text}"
        
        # Test with all "insuffisant" values
        test_data = generate_test_report()
        for key in test_data:
            if key.startswith(("hall", "corridor", "stair", "tech", "prof")) and key.endswith(("s", "rs")):
                test_data[key] = "insuffisant"
        
        response = requests.post(f"{API_URL}/cleaning-report", json=test_data)
        assert response.status_code == 200, f"Failed to create report with 'insuffisant' values: {response.text}"
        
        print("✅ Different evaluation values test passed")
        return True
    except Exception as e:
        print(f"❌ Different evaluation values test failed: {str(e)}")
        return False

def run_all_tests():
    print("\n========================================")
    print("STARTING BRIGADE DE NETTOYAGE API TESTS")
    print("========================================")
    
    test_results = {}
    
    # Test root endpoint
    test_results["root_endpoint"] = test_root_endpoint()
    
    # Test creating a cleaning report
    success, report_id = test_create_cleaning_report()
    test_results["create_cleaning_report"] = success
    
    # Test getting all cleaning reports
    test_results["get_all_cleaning_reports"] = test_get_all_cleaning_reports()
    
    # Test getting a specific cleaning report
    if report_id:
        test_results["get_specific_cleaning_report"] = test_get_specific_cleaning_report(report_id)
    else:
        test_results["get_specific_cleaning_report"] = False
        print("❌ Skipping specific report test due to failed creation")
    
    # Test non-existent report
    test_results["nonexistent_report"] = test_nonexistent_report()
    
    # Test different evaluation values
    test_results["different_evaluation_values"] = test_different_evaluation_values()
    
    # Print summary
    print("\n========================================")
    print("TEST SUMMARY")
    print("========================================")
    
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        if not result:
            all_passed = False
        print(f"{test_name}: {status}")
    
    print("\n========================================")
    if all_passed:
        print("🎉 ALL TESTS PASSED! 🎉")
    else:
        print("❌ SOME TESTS FAILED ❌")
    print("========================================")
    
    return all_passed

if __name__ == "__main__":
    run_all_tests()