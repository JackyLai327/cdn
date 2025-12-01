.PHONY: dev-init dev-validate dev-plan dev-apply dev-destroy

dev-init:
	terraform -chdir=envs/dev init

dev-validate:
	terraform -chdir=envs/dev validate

dev-plan:
	terraform -chdir=envs/dev plan

dev-apply:
	terraform -chdir=envs/dev apply -auto-approve
	# Ensure script is executable and run it
	chmod +x ../k8s/setup.sh
	../k8s/setup.sh

dev-destroy:
	# Delete Ingress first to remove ALB (prevents VPC deletion hang)
	-kubectl delete -f ../k8s/ingress-app.yaml
	# Wait a moment for ALB deletion to start
	sleep 10
	# Run Terraform destroy
	terraform -chdir=envs/dev destroy -auto-approve
	# Optional: Run nuke for anything left over
	# ../nuke.sh
