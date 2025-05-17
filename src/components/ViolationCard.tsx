
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock, Calendar, Hash, Layers, MapPin, ChevronDown, ChevronUp, Info, FileText } from 'lucide-react';
import { ViolationType } from '@/utils/types';
import AnimatedContainer from './AnimatedContainer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ViolationCardProps {
  violation: ViolationType;
  index: number;
}

const ViolationCard = ({ violation, index }: ViolationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Closed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Open': return <AlertTriangle className="h-3.5 w-3.5" />;
      case 'Closed': return <CheckCircle className="h-3.5 w-3.5" />;
      case 'In Progress': return <Clock className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const hasRelatedViolations = violation.relatedViolationsCount && violation.relatedViolationsCount > 0 && violation.relatedViolations && violation.relatedViolations.length > 0;

  return (
    <>
      <AnimatedContainer 
        delay={index * 100} 
        className="w-full"
      >
        <Card 
          className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-border hover:bg-accent/5 cursor-pointer"
          onClick={() => setShowDetails(true)}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex flex-col space-y-1.5">
              <h3 className="font-medium text-base">{violation.agency_name}</h3>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{violation.address}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Investigation Date: {formatDate(violation.inspection_date)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Case #: {violation.casefile_number}</span>
                </div>
                {violation.relatedViolationsCount && violation.relatedViolationsCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{violation.relatedViolationsCount} related violation{violation.relatedViolationsCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1 font-normal", getStatusColor(violation.status))}
            >
              {getStatusIcon(violation.status)}
              {violation.status}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-sm mb-3 whitespace-pre-line">{violation.violation_description}</p>
            
            {/* Investigation Info - Made more prominent */}
            <div className="space-y-2 mb-3">
              {violation.investigation_outcome && (
                <div className="flex items-start gap-1 p-2 bg-green-50 dark:bg-green-900/10 rounded-md">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <div>
                    <span className="font-medium text-sm">Investigation Outcome:</span> 
                    <p className="text-sm">{violation.investigation_outcome}</p>
                  </div>
                </div>
              )}
              {violation.investigation_findings && (
                <div className="flex items-start gap-1 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                  <FileText className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div>
                    <span className="font-medium text-sm">Investigation Findings:</span> 
                    <p className="text-sm whitespace-pre-line">{violation.investigation_findings}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          {hasRelatedViolations && (
            <CardFooter className="p-4 pt-0">
              <Button 
                variant="outline" 
                className="w-full text-sm flex items-center justify-center gap-1"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking this button
                  toggleExpanded();
                }}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide related violations
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View {violation.relatedViolationsCount} related violation{violation.relatedViolationsCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {expanded && hasRelatedViolations && (
          <div className="pl-6 border-l-2 border-dashed border-gray-300 ml-4 mt-2 space-y-3">
            {violation.relatedViolations?.map((relatedViolation, relatedIndex) => (
              <Card 
                key={relatedIndex} 
                className="overflow-hidden border border-border hover:shadow-md transition-shadow duration-300 hover:bg-accent/5 cursor-pointer"
                onClick={() => setShowDetails(true)}
              >
                <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex flex-col space-y-1">
                    <h4 className="font-medium text-sm">{relatedViolation.agency_name}</h4>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{relatedViolation.address}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Investigation Date: {formatDate(relatedViolation.inspection_date)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("flex items-center gap-1 font-normal text-xs", getStatusColor(relatedViolation.status))}
                  >
                    {getStatusIcon(relatedViolation.status)}
                    {relatedViolation.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs mb-2 whitespace-pre-line">{relatedViolation.violation_description}</p>
                  
                  {/* Related Violation Investigation Info */}
                  <div className="space-y-1.5 mb-2">
                    {relatedViolation.investigation_outcome && (
                      <div className="flex items-start gap-1 p-1.5 bg-green-50 dark:bg-green-900/10 rounded text-xs">
                        <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                        <div>
                          <span className="font-medium">Outcome:</span> {relatedViolation.investigation_outcome}
                        </div>
                      </div>
                    )}
                    {relatedViolation.investigation_findings && (
                      <div className="flex items-start gap-1 p-1.5 bg-blue-50 dark:bg-blue-900/10 rounded text-xs">
                        <FileText className="h-3 w-3 mt-0.5 text-blue-500" />
                        <div>
                          <span className="font-medium">Findings:</span> <span className="whitespace-pre-line">{relatedViolation.investigation_findings}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </AnimatedContainer>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{violation.agency_name}</DialogTitle>
            <DialogDescription>
              <Badge 
                variant="outline" 
                className={cn("mt-2 flex items-center gap-1 font-normal", getStatusColor(violation.status))}
              >
                {getStatusIcon(violation.status)}
                {violation.status}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Address:</strong> {violation.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Investigation Date:</strong> {formatDate(violation.inspection_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Case #:</strong> {violation.casefile_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Property Owner:</strong> {violation.owner_name}</span>
                    </div>
                  </div>
                </div>
                
                {/* Investigation Information Section in Dialog */}
                {(violation.investigation_outcome || violation.investigation_findings) && (
                  <div className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                    <h3 className="text-sm font-medium mb-2">Investigation Results</h3>
                    <div className="space-y-3 text-sm">
                      {violation.investigation_outcome && (
                        <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                          <div>
                            <strong>Investigation Outcome:</strong> 
                            <p>{violation.investigation_outcome}</p>
                          </div>
                        </div>
                      )}
                      {violation.investigation_findings && (
                        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded">
                          <FileText className="h-4 w-4 mt-0.5 text-blue-500" />
                          <div>
                            <strong>Investigation Findings:</strong> 
                            <p className="whitespace-pre-line">{violation.investigation_findings}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Violation Description</h3>
                <p className="text-sm whitespace-pre-line">{violation.violation_description}</p>
              </div>
            </div>
            
            {hasRelatedViolations && (
              <div>
                <h3 className="text-base font-medium mb-3">Related Violations ({violation.relatedViolationsCount})</h3>
                <div className="space-y-4">
                  {violation.relatedViolations?.map((relatedViolation, idx) => (
                    <Card key={idx} className="border border-border">
                      <CardHeader className="p-3 pb-2">
                        <div className="flex flex-row items-start justify-between">
                          <h4 className="font-medium text-sm">{relatedViolation.agency_name}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn("flex items-center gap-1 font-normal text-xs", getStatusColor(relatedViolation.status))}
                          >
                            {getStatusIcon(relatedViolation.status)}
                            {relatedViolation.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col space-y-1 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{relatedViolation.address}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Investigation Date: {formatDate(relatedViolation.inspection_date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Info className="h-3 w-3" />
                            <span>Property Owner: {relatedViolation.owner_name}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <p className="text-xs mb-2 whitespace-pre-line">{relatedViolation.violation_description}</p>
                        
                        {/* Related Violation Investigation Detail */}
                        <div className="space-y-2 mb-2">
                          {relatedViolation.investigation_outcome && (
                            <div className="flex items-start gap-1 p-1.5 bg-green-50 dark:bg-green-900/10 rounded text-xs">
                              <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                              <div>
                                <span className="font-medium">Investigation Outcome:</span> {relatedViolation.investigation_outcome}
                              </div>
                            </div>
                          )}
                          {relatedViolation.investigation_findings && (
                            <div className="flex items-start gap-1 p-1.5 bg-blue-50 dark:bg-blue-900/10 rounded text-xs">
                              <FileText className="h-3 w-3 mt-0.5 text-blue-500" />
                              <div>
                                <span className="font-medium">Investigation Findings:</span>
                                <p className="whitespace-pre-line">{relatedViolation.investigation_findings}</p> 
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViolationCard;
